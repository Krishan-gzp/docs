# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Run Setup
```bash
chmod +x setup.sh
./setup.sh
```

### Step 2: Start Backend
```bash
cd backend
./start.sh
```

### Step 3: Start Frontend (in new terminal)
```bash
cd frontend
./start.sh
```

## 🌐 Access Application
Open: http://localhost:4200

## 📋 Quick Test
1. Upload an image of a bridge or building
2. Click "Upload Image"
3. Click "Analyze for Cracks" 
4. View results and download report

## ⚠️ Important Notes
- **Model Path**: Update `backend/main.py` line 28 if your YOLOv11 model is not at:
  `/content/drive/MyDrive/yolo-new/bridge_crack_yolov11_best.pt`
  
- **Server Status**: Check the status indicator in the app header:
  - 🟢 Green = Ready to use
  - 🟡 Yellow = Model not found
  - 🔴 Red = Server error

## 🔧 Troubleshooting
- **Can't connect**: Make sure both backend (port 8000) and frontend (port 4200) are running
- **Model issues**: Verify the model file path and file integrity
- **Upload fails**: Check image format (JPG/PNG) and size (max 10MB)

For detailed documentation, see `README.md`