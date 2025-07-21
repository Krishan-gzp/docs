from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os
from PIL import Image as PILImage
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

class ReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom styles for the report"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomNormal',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6
        ))
    
    def generate_report(self, prediction_data, original_image_path, result_image_path, output_path):
        """Generate a comprehensive PDF report"""
        doc = SimpleDocTemplate(output_path, pagesize=A4, topMargin=0.5*inch)
        story = []
        
        # Title
        title = Paragraph("Crack Detection Analysis Report", self.styles['CustomTitle'])
        story.append(title)
        story.append(Spacer(1, 20))
        
        # Report metadata
        metadata_data = [
            ['Report Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Analysis ID:', prediction_data['file_id']],
            ['Model:', 'YOLOv11 Bridge Crack Detection'],
            ['Status:', 'Completed']
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2*inch, 3*inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(metadata_table)
        story.append(Spacer(1, 20))
        
        # Executive Summary
        story.append(Paragraph("Executive Summary", self.styles['CustomHeading']))
        
        crack_status = "DETECTED" if prediction_data['crack_detected'] else "NOT DETECTED"
        summary_text = f"""
        <b>Crack Detection Status:</b> {crack_status}<br/>
        <b>Number of Cracks Found:</b> {prediction_data['crack_count']}<br/>
        <b>Crack Severity Percentage:</b> {prediction_data['crack_percentage']}%<br/>
        <b>Average Confidence Score:</b> {prediction_data['average_confidence']:.4f}<br/>
        <b>Analysis Timestamp:</b> {prediction_data['timestamp']}
        """
        
        story.append(Paragraph(summary_text, self.styles['CustomNormal']))
        story.append(Spacer(1, 20))
        
        # Risk Assessment
        story.append(Paragraph("Risk Assessment", self.styles['CustomHeading']))
        
        if prediction_data['crack_percentage'] > 80:
            risk_level = "HIGH RISK"
            risk_color = "red"
            recommendation = "Immediate inspection and repair required. Structure may be compromised."
        elif prediction_data['crack_percentage'] > 50:
            risk_level = "MEDIUM RISK"
            risk_color = "orange"
            recommendation = "Schedule detailed inspection within 30 days. Monitor crack progression."
        elif prediction_data['crack_percentage'] > 20:
            risk_level = "LOW RISK"
            risk_color = "yellow"
            recommendation = "Regular monitoring recommended. Include in routine maintenance schedule."
        else:
            risk_level = "MINIMAL RISK"
            risk_color = "green"
            recommendation = "No immediate action required. Continue regular inspections."
        
        risk_text = f"""
        <b><font color="{risk_color}">Risk Level: {risk_level}</font></b><br/>
        <b>Recommendation:</b> {recommendation}
        """
        
        story.append(Paragraph(risk_text, self.styles['CustomNormal']))
        story.append(Spacer(1, 20))
        
        # Images Section
        story.append(Paragraph("Visual Analysis", self.styles['CustomHeading']))
        
        # Original Image
        if os.path.exists(original_image_path):
            story.append(Paragraph("<b>Original Image:</b>", self.styles['CustomNormal']))
            try:
                # Resize image to fit page
                img = PILImage.open(original_image_path)
                aspect_ratio = img.width / img.height
                img_width = 4 * inch
                img_height = img_width / aspect_ratio
                
                if img_height > 3 * inch:
                    img_height = 3 * inch
                    img_width = img_height * aspect_ratio
                
                original_img = Image(original_image_path, width=img_width, height=img_height)
                story.append(original_img)
                story.append(Spacer(1, 10))
            except Exception as e:
                story.append(Paragraph(f"Error loading original image: {str(e)}", self.styles['CustomNormal']))
        
        # Result Image
        if os.path.exists(result_image_path):
            story.append(Paragraph("<b>Detection Results:</b>", self.styles['CustomNormal']))
            try:
                # Resize image to fit page
                img = PILImage.open(result_image_path)
                aspect_ratio = img.width / img.height
                img_width = 4 * inch
                img_height = img_width / aspect_ratio
                
                if img_height > 3 * inch:
                    img_height = 3 * inch
                    img_width = img_height * aspect_ratio
                
                result_img = Image(result_image_path, width=img_width, height=img_height)
                story.append(result_img)
                story.append(Spacer(1, 20))
            except Exception as e:
                story.append(Paragraph(f"Error loading result image: {str(e)}", self.styles['CustomNormal']))
        
        # Detailed Detection Results
        if prediction_data['predictions']:
            story.append(Paragraph("Detailed Detection Results", self.styles['CustomHeading']))
            
            detection_data = [['Class', 'Confidence Score', 'Bounding Box (x1, y1, x2, y2)']]
            
            for i, pred in enumerate(prediction_data['predictions']):
                bbox_str = f"({pred['bbox'][0]:.1f}, {pred['bbox'][1]:.1f}, {pred['bbox'][2]:.1f}, {pred['bbox'][3]:.1f})"
                detection_data.append([
                    pred['class'],
                    f"{pred['confidence']:.4f}",
                    bbox_str
                ])
            
            detection_table = Table(detection_data, colWidths=[1.5*inch, 1.5*inch, 2.5*inch])
            detection_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(detection_table)
            story.append(Spacer(1, 20))
        
        # Technical Details
        story.append(Paragraph("Technical Details", self.styles['CustomHeading']))
        
        technical_text = f"""
        <b>Model Information:</b><br/>
        • Model Type: YOLOv11 (You Only Look Once version 11)<br/>
        • Task: Object Detection for Crack Identification<br/>
        • Training Dataset: Bridge/Infrastructure Crack Dataset<br/>
        • Model Path: /content/drive/MyDrive/yolo-new/bridge_crack_yolov11_best.pt<br/><br/>
        
        <b>Analysis Parameters:</b><br/>
        • Input Image Format: {original_image_path.split('.')[-1].upper()}<br/>
        • Detection Threshold: Model Default<br/>
        • Non-Maximum Suppression: Enabled<br/>
        • Output Format: Bounding Boxes with Confidence Scores<br/><br/>
        
        <b>Performance Metrics:</b><br/>
        • Total Detections: {len(prediction_data['predictions'])}<br/>
        • Crack-specific Detections: {prediction_data['crack_count']}<br/>
        • Average Confidence: {prediction_data['average_confidence']:.4f}<br/>
        • Processing Status: Successful
        """
        
        story.append(Paragraph(technical_text, self.styles['CustomNormal']))
        story.append(Spacer(1, 20))
        
        # Disclaimer
        story.append(Paragraph("Disclaimer", self.styles['CustomHeading']))
        disclaimer_text = """
        This automated crack detection analysis is provided as a tool to assist in structural assessment. 
        The results should be validated by qualified structural engineers before making any critical decisions. 
        This system is designed to aid in inspection processes but should not replace professional engineering judgment. 
        Regular maintenance and professional inspections are recommended regardless of these results.
        """
        story.append(Paragraph(disclaimer_text, self.styles['CustomNormal']))
        
        # Build PDF
        doc.build(story)
        
        return output_path