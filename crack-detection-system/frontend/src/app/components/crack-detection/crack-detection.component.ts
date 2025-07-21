import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CrackDetectionService, PredictionResult, UploadResponse } from '../../services/crack-detection.service';

@Component({
  selector: 'app-crack-detection',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './crack-detection.component.html',
  styleUrls: ['./crack-detection.component.css']
})
export class CrackDetectionComponent implements OnInit {
  selectedFile: File | null = null;
  uploadedFileId: string | null = null;
  predictionResult: PredictionResult | null = null;
  isUploading = false;
  isPredicting = false;
  isGeneratingReport = false;
  isDownloadingReport = false;
  uploadProgress = 0;
  predictionProgress = 0;
  imagePreviewUrl: string | null = null;
  resultImageUrl: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  serverStatus: string = 'checking';

  constructor(private crackDetectionService: CrackDetectionService) {}

  ngOnInit() {
    this.checkServerHealth();
  }

  checkServerHealth() {
    this.crackDetectionService.checkHealth().subscribe({
      next: (response) => {
        this.serverStatus = response.model_loaded ? 'ready' : 'model-not-loaded';
      },
      error: (error) => {
        this.serverStatus = 'error';
        console.error('Server health check failed:', error);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  private handleFileSelection(file: File) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('File size must be less than 10MB');
      return;
    }

    this.selectedFile = file;
    this.clearResults();

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.showSuccess('Image selected successfully');
  }

  uploadImage() {
    if (!this.selectedFile) {
      this.showError('Please select an image first');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.clearMessages();

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 100);

    this.crackDetectionService.uploadImage(this.selectedFile).subscribe({
      next: (response: UploadResponse) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.uploadedFileId = response.file_id;
        this.isUploading = false;
        this.showSuccess('Image uploaded successfully');
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadProgress = 0;
        this.showError(`Upload failed: ${error.message}`);
      }
    });
  }

  predictCracks() {
    if (!this.uploadedFileId) {
      this.showError('Please upload an image first');
      return;
    }

    this.isPredicting = true;
    this.predictionProgress = 0;
    this.clearMessages();

    // Simulate prediction progress
    const progressInterval = setInterval(() => {
      this.predictionProgress += 15;
      if (this.predictionProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    this.crackDetectionService.predictCracks(this.uploadedFileId).subscribe({
      next: (result: PredictionResult) => {
        clearInterval(progressInterval);
        this.predictionProgress = 100;
        this.predictionResult = result;
        this.resultImageUrl = this.crackDetectionService.getResultImage(result.file_id);
        this.isPredicting = false;
        this.showSuccess('Prediction completed successfully');
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isPredicting = false;
        this.predictionProgress = 0;
        this.showError(`Prediction failed: ${error.message}`);
      }
    });
  }

  generateAndDownloadReport() {
    if (!this.uploadedFileId) {
      this.showError('No prediction data available');
      return;
    }

    this.isGeneratingReport = true;
    this.clearMessages();

    this.crackDetectionService.generateReport(this.uploadedFileId).subscribe({
      next: (response) => {
        this.isGeneratingReport = false;
        this.downloadReport();
      },
      error: (error) => {
        this.isGeneratingReport = false;
        this.showError(`Report generation failed: ${error.message}`);
      }
    });
  }

  private downloadReport() {
    if (!this.uploadedFileId) return;

    this.isDownloadingReport = true;

    this.crackDetectionService.downloadReport(this.uploadedFileId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `crack_detection_report_${this.uploadedFileId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isDownloadingReport = false;
        this.showSuccess('Report downloaded successfully');
      },
      error: (error) => {
        this.isDownloadingReport = false;
        this.showError(`Download failed: ${error.message}`);
      }
    });
  }

  resetAnalysis() {
    // Cleanup files on server
    if (this.uploadedFileId) {
      this.crackDetectionService.cleanupFiles(this.uploadedFileId).subscribe();
    }

    this.selectedFile = null;
    this.uploadedFileId = null;
    this.predictionResult = null;
    this.imagePreviewUrl = null;
    this.resultImageUrl = null;
    this.clearResults();
    this.clearMessages();
    this.showSuccess('Analysis reset. Ready for new image.');
  }

  getRiskLevel(): string {
    if (!this.predictionResult) return '';
    
    const percentage = this.predictionResult.crack_percentage;
    if (percentage > 80) return 'high-risk';
    if (percentage > 50) return 'medium-risk';
    if (percentage > 20) return 'low-risk';
    return 'no-risk';
  }

  getRiskLabel(): string {
    if (!this.predictionResult) return '';
    
    const percentage = this.predictionResult.crack_percentage;
    if (percentage > 80) return 'HIGH RISK';
    if (percentage > 50) return 'MEDIUM RISK';
    if (percentage > 20) return 'LOW RISK';
    return 'MINIMAL RISK';
  }

  private clearResults() {
    this.uploadProgress = 0;
    this.predictionProgress = 0;
    this.resultImageUrl = null;
  }

  private clearMessages() {
    this.errorMessage = null;
    this.successMessage = null;
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = null;
    setTimeout(() => this.clearMessages(), 5000);
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = null;
    setTimeout(() => this.clearMessages(), 3000);
  }
}