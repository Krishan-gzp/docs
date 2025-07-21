from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import os
import uuid
from datetime import datetime
from report_generator import ReportGenerator
import json
import shutil

app = FastAPI(title="Crack Detection API", version="1.0.0")

# CORS middleware for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize YOLO model
MODEL_PATH = "/content/drive/MyDrive/yolo-new/bridge_crack_yolov11_best.pt"
try:
    model = YOLO(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Create directories for uploads and results
os.makedirs("uploads", exist_ok=True)
os.makedirs("results", exist_ok=True)
os.makedirs("reports", exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Crack Detection API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image for crack detection"""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split(".")[-1]
        filename = f"{file_id}.{file_extension}"
        file_path = f"uploads/{filename}"
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "file_id": file_id,
            "filename": filename,
            "message": "File uploaded successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@app.post("/predict/{file_id}")
async def predict_cracks(file_id: str):
    """Predict cracks in the uploaded image"""
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Find the uploaded file
        uploaded_files = [f for f in os.listdir("uploads") if f.startswith(file_id)]
        if not uploaded_files:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path = f"uploads/{uploaded_files[0]}"
        
        # Load and preprocess image
        image = cv2.imread(file_path)
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Run YOLO prediction
        results = model(image)
        
        # Process results
        predictions = []
        total_confidence = 0
        crack_count = 0
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    confidence = float(box.conf[0])
                    class_id = int(box.cls[0])
                    class_name = model.names[class_id]
                    
                    # Extract bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    
                    predictions.append({
                        "class": class_name,
                        "confidence": confidence,
                        "bbox": [x1, y1, x2, y2]
                    })
                    
                    if class_name.lower() in ["crack", "cracks"]:
                        total_confidence += confidence
                        crack_count += 1
        
        # Calculate overall crack detection metrics
        avg_confidence = total_confidence / crack_count if crack_count > 0 else 0
        crack_percentage = min((crack_count * avg_confidence * 100), 100)
        
        # Save annotated image
        annotated_image = results[0].plot()
        result_filename = f"result_{file_id}.jpg"
        result_path = f"results/{result_filename}"
        cv2.imwrite(result_path, annotated_image)
        
        # Prepare response
        response_data = {
            "file_id": file_id,
            "crack_detected": crack_count > 0,
            "crack_count": crack_count,
            "crack_percentage": round(crack_percentage, 2),
            "average_confidence": round(avg_confidence, 4),
            "predictions": predictions,
            "result_image": result_filename,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save prediction data for report generation
        with open(f"results/{file_id}_data.json", "w") as f:
            json.dump(response_data, f, indent=2)
        
        return response_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/result-image/{file_id}")
async def get_result_image(file_id: str):
    """Get the annotated result image"""
    result_path = f"results/result_{file_id}.jpg"
    if not os.path.exists(result_path):
        raise HTTPException(status_code=404, detail="Result image not found")
    
    return FileResponse(result_path, media_type="image/jpeg")

@app.post("/generate-report/{file_id}")
async def generate_report(file_id: str):
    """Generate a PDF report for the prediction"""
    try:
        # Load prediction data
        data_path = f"results/{file_id}_data.json"
        if not os.path.exists(data_path):
            raise HTTPException(status_code=404, detail="Prediction data not found")
        
        with open(data_path, "r") as f:
            prediction_data = json.load(f)
        
        # Generate report
        report_generator = ReportGenerator()
        report_path = f"reports/crack_detection_report_{file_id}.pdf"
        
        original_image_path = f"uploads/{[f for f in os.listdir('uploads') if f.startswith(file_id)][0]}"
        result_image_path = f"results/result_{file_id}.jpg"
        
        report_generator.generate_report(
            prediction_data, 
            original_image_path, 
            result_image_path, 
            report_path
        )
        
        return {
            "report_id": file_id,
            "report_path": report_path,
            "message": "Report generated successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

@app.get("/download-report/{file_id}")
async def download_report(file_id: str):
    """Download the generated PDF report"""
    report_path = f"reports/crack_detection_report_{file_id}.pdf"
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not found")
    
    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=f"crack_detection_report_{file_id}.pdf"
    )

@app.delete("/cleanup/{file_id}")
async def cleanup_files(file_id: str):
    """Clean up uploaded files and results"""
    try:
        # Remove uploaded file
        for file in os.listdir("uploads"):
            if file.startswith(file_id):
                os.remove(f"uploads/{file}")
        
        # Remove result files
        for file in os.listdir("results"):
            if file.startswith(file_id) or file.startswith(f"result_{file_id}"):
                os.remove(f"results/{file}")
        
        # Remove report
        report_path = f"reports/crack_detection_report_{file_id}.pdf"
        if os.path.exists(report_path):
            os.remove(report_path)
        
        return {"message": "Files cleaned up successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)