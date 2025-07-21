import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PredictionResult {
  file_id: string;
  crack_detected: boolean;
  crack_count: number;
  crack_percentage: number;
  average_confidence: number;
  predictions: Array<{
    class: string;
    confidence: number;
    bbox: number[];
  }>;
  result_image: string;
  timestamp: string;
}

export interface UploadResponse {
  file_id: string;
  filename: string;
  message: string;
}

export interface ReportResponse {
  report_id: string;
  report_path: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CrackDetectionService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  predictCracks(fileId: string): Observable<PredictionResult> {
    return this.http.post<PredictionResult>(`${this.apiUrl}/predict/${fileId}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  getResultImage(fileId: string): string {
    return `${this.apiUrl}/result-image/${fileId}`;
  }

  generateReport(fileId: string): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.apiUrl}/generate-report/${fileId}`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  downloadReport(fileId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download-report/${fileId}`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`)
      .pipe(
        catchError(this.handleError)
      );
  }

  cleanupFiles(fileId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cleanup/${fileId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Network error or CORS issue
      errorMessage = 'Network Error: Cannot connect to server. Please check if the backend is running on http://localhost:8000';
    } else if (error.status >= 500) {
      // Server error
      errorMessage = `Server Error: ${error.status} - Internal server error`;
    } else if (error.status >= 400) {
      // Client error
      const detail = error.error?.detail || error.error?.message || error.message || 'Bad request';
      errorMessage = `Request Error: ${error.status} - ${detail}`;
    } else {
      // Other errors
      errorMessage = `Error: ${error.status} - ${error.error?.detail || error.message || 'Unknown error'}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}