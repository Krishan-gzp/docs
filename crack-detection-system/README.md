# Crack Detection System

An AI-powered crack detection system using YOLOv11 for infrastructure inspection. This system provides a complete solution with a Python FastAPI backend and Angular frontend for detecting cracks in bridge and building structures.

## Features

- **Upload Interface**: Drag-and-drop or click-to-browse image upload
- **AI Prediction**: YOLOv11-based crack detection with confidence scores
- **Visual Results**: Side-by-side comparison of original and annotated images
- **Risk Assessment**: Automated risk level calculation based on crack severity
- **PDF Reports**: Comprehensive analysis reports with detailed findings
- **Real-time Status**: Server health monitoring and progress tracking

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Angular       │────▶│   FastAPI       │────▶│   YOLOv11       │
│   Frontend      │     │   Backend       │     │   Model         │
│                 │     │                 │     │                 │
│ • File Upload   │     │ • Image Proc.   │     │ • Crack Det.    │
│ • Results UI    │     │ • Prediction    │     │ • Confidence    │
│ • Report DL     │     │ • Report Gen.   │     │ • Bounding Box  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Prerequisites

### Backend Requirements
- Python 3.8 or higher
- Virtual environment (recommended)
- CUDA-compatible GPU (optional, for faster inference)

### Frontend Requirements
- Node.js 16 or higher
- npm or yarn package manager
- Angular CLI

### Model Requirements
- YOLOv11 model trained for crack detection
- Model file should be located at: `/content/drive/MyDrive/yolo-new/bridge_crack_yolov11_best.pt`

## Installation & Setup

### 1. Clone/Download the Project
```bash
# Extract the crack-detection-system folder to your desired location
cd crack-detection-system
```

### 2. Backend Setup

#### Step 1: Navigate to backend directory
```bash
cd backend
```

#### Step 2: Create and activate virtual environment
```bash
# Create virtual environment
python -m venv venv

# Activate on Linux/Mac
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

#### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

#### Step 4: Update model path (if needed)
Edit `main.py` and update the `MODEL_PATH` variable if your model is located elsewhere:
```python
MODEL_PATH = "/your/path/to/bridge_crack_yolov11_best.pt"
```

#### Step 5: Start the backend server
```bash
# Option 1: Using the start script
chmod +x start.sh
./start.sh

# Option 2: Direct Python command
python main.py
```

The backend server will start on `http://localhost:8000`

### 3. Frontend Setup

#### Step 1: Navigate to frontend directory
```bash
cd ../frontend
```

#### Step 2: Install dependencies
```bash
npm install
```

#### Step 3: Start the development server
```bash
npm start
# or
ng serve
```

The frontend will be available at `http://localhost:4200`

## Usage Guide

### 1. Access the Application
Open your web browser and navigate to `http://localhost:4200`

### 2. Check Server Status
The header displays the current server status:
- **Green**: Server Ready - Model loaded successfully
- **Yellow**: Model Not Loaded - Check model path
- **Red**: Server Error - Backend not running
- **Gray**: Checking Status - Loading...

### 3. Upload an Image
- **Method 1**: Click on the upload area and select an image file
- **Method 2**: Drag and drop an image file onto the upload area
- **Supported formats**: JPG, PNG, JPEG
- **Maximum size**: 10MB

### 4. Run Crack Detection
1. Click "Upload Image" to send the image to the server
2. Click "Analyze for Cracks" to run the AI prediction
3. View the results including:
   - Crack detection status
   - Number of cracks found
   - Severity percentage
   - Confidence scores
   - Annotated image with bounding boxes

### 5. Download Report
- Click "Download Report" to generate and download a comprehensive PDF report
- The report includes:
  - Executive summary
  - Risk assessment
  - Visual analysis (original and annotated images)
  - Detailed detection results
  - Technical specifications
  - Recommendations

### 6. Reset or Analyze New Image
- Click "New Analysis" to upload a different image
- Click "Re-analyze" to run detection again on the same image

## API Documentation

### Backend Endpoints

#### Health Check
```
GET /health
Response: Server status and model loading state
```

#### Upload Image
```
POST /upload
Body: multipart/form-data with image file
Response: file_id for subsequent operations
```

#### Predict Cracks
```
POST /predict/{file_id}
Response: Detailed prediction results with metrics
```

#### Get Result Image
```
GET /result-image/{file_id}
Response: Annotated image with detection boxes
```

#### Generate Report
```
POST /generate-report/{file_id}
Response: Report generation confirmation
```

#### Download Report
```
GET /download-report/{file_id}
Response: PDF file download
```

#### Cleanup Files
```
DELETE /cleanup/{file_id}
Response: File cleanup confirmation
```

## Configuration

### Backend Configuration
Edit `main.py` to customize:
- Model path
- Server host and port
- CORS settings
- File size limits

### Frontend Configuration
Edit `src/app/services/crack-detection.service.ts` to customize:
- Backend API URL
- Request timeouts
- Error handling

## Troubleshooting

### Common Issues

#### 1. Model Not Loading
**Problem**: Yellow status indicator showing "Model Not Loaded"
**Solution**: 
- Check if the model file exists at the specified path
- Verify the model file is not corrupted
- Ensure sufficient disk space and memory

#### 2. CORS Errors
**Problem**: Frontend cannot connect to backend
**Solution**:
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in `main.py`
- Verify frontend is running on `http://localhost:4200`

#### 3. File Upload Errors
**Problem**: Images fail to upload
**Solution**:
- Check file size (max 10MB)
- Verify image format (JPG, PNG, JPEG)
- Ensure backend `uploads` directory exists

#### 4. Prediction Failures
**Problem**: AI analysis fails
**Solution**:
- Verify model is loaded correctly
- Check image is valid and not corrupted
- Monitor backend logs for detailed error messages

#### 5. Report Generation Issues
**Problem**: PDF reports fail to generate
**Solution**:
- Ensure `reports` directory exists
- Check if prediction data is available
- Verify ReportLab dependencies are installed

### Log Files
Backend logs are displayed in the terminal where the server is running. Monitor these for detailed error information.

## Development

### Project Structure
```
crack-detection-system/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── report_generator.py  # PDF report generation
│   ├── requirements.txt     # Python dependencies
│   ├── start.sh            # Startup script
│   ├── uploads/            # Uploaded images (created at runtime)
│   ├── results/            # Processing results (created at runtime)
│   └── reports/            # Generated reports (created at runtime)
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   └── crack-detection/
    │   │   ├── services/
    │   │   └── app.component.ts
    │   ├── styles.css
    │   └── index.html
    ├── package.json
    ├── angular.json
    └── tsconfig.json
```

### Extending the System

#### Adding New Features
1. **Backend**: Add new endpoints in `main.py`
2. **Frontend**: Create new Angular components and services
3. **Reports**: Modify `report_generator.py` for custom report sections

#### Model Integration
To use a different YOLO model:
1. Update the `MODEL_PATH` in `main.py`
2. Modify class names and confidence thresholds if needed
3. Update the prediction processing logic for different output formats

## Security Considerations

- File upload validation (size, type)
- Input sanitization for API endpoints
- Temporary file cleanup
- CORS restrictions for production deployment

## License

This project is provided as-is for educational and research purposes. Please ensure you have the necessary rights to use the YOLOv11 model and any training data.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the backend logs for error details
3. Verify all dependencies are correctly installed
4. Ensure the model file is accessible and valid

## Performance Notes

- GPU acceleration significantly improves inference speed
- Larger images take longer to process
- Report generation time depends on image size and detection count
- Consider implementing caching for production deployment