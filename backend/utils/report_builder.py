"""
SatQuery AI - Analytical Report Builder
Generates auditable PDF and JSON reports for remote-sensing analysis sessions.
"""
import os
import json
import base64
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from backend.config import OUTPUT_DIR

class ReportBuilder:
    """
    Builds structured, auditable PDF and JSON reports for remote-sensing query sessions.
    """
    @staticmethod
    def generate_pdf_report(session_id: str, analysis_result: Dict[str, Any], output_path: Optional[str or Path] = None) -> Path:
        if output_path is None:
            output_path = OUTPUT_DIR / f"SatQuery_Report_{session_id}.pdf"
        else:
            output_path = Path(output_path)
            
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Heading1"],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0f172a"),
            alignment=TA_CENTER,
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            "SubTitleStyle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#475569"),
            alignment=TA_CENTER,
            spaceAfter=15
        )
        h2_style = ParagraphStyle(
            "H2Style",
            parent=styles["Heading2"],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#1e3a8a"),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "BodyStyle",
            parent=styles["BodyText"],
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#334155")
        )
        bold_body_style = ParagraphStyle(
            "BoldBodyStyle",
            parent=body_style,
            fontName="Helvetica-Bold"
        )
        
        story = []
        
        # Header Banner
        story.append(Paragraph("<b>SATQUERY AI - REMOTE SENSING ANALYSIS REPORT</b>", title_style))
        story.append(Paragraph("<b>Theme:</b> Space Technology | <b>Agency:</b> ISRO / SAC Evaluation Standard", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=12))
        
        # Session Metadata Table
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        meta_data = [
            [Paragraph("<b>Session ID:</b>", bold_body_style), Paragraph(session_id, body_style),
             Paragraph("<b>Date/Time:</b>", bold_body_style), Paragraph(now_str, body_style)],
            [Paragraph("<b>Selected Task:</b>", bold_body_style), Paragraph(analysis_result.get("task", "RS_ANALYSIS"), body_style),
             Paragraph("<b>Confidence Score:</b>", bold_body_style), Paragraph(f"{analysis_result.get('confidence', 0.95)*100:.1f}% ({analysis_result.get('confidence_level', 'High')})", body_style)]
        ]
        meta_table = Table(meta_data, colWidths=[100, 170, 100, 170])
        meta_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 12))
        
        # Query & Natural Language Response
        trace = analysis_result.get("execution_trace", {})
        query_text = trace.get("query", "Remote sensing multimodal analysis")
        story.append(Paragraph("<b>User Query:</b>", h2_style))
        story.append(Paragraph(f"<i>\"{query_text}\"</i>", body_style))
        story.append(Spacer(1, 8))
        
        story.append(Paragraph("<b>Synthesized Agentic Response:</b>", h2_style))
        story.append(Paragraph(analysis_result.get("text_response", "N/A"), body_style))
        story.append(Spacer(1, 12))
        
        # Quantitative Metrics Table
        quant = analysis_result.get("quantitative_metrics", {})
        if quant:
            story.append(Paragraph("<b>Quantitative Remote-Sensing Metrics:</b>", h2_style))
            quant_rows = [[Paragraph("<b>Metric Parameter</b>", bold_body_style), Paragraph("<b>Evaluated Value / Distribution</b>", bold_body_style)]]
            
            for k, v in quant.items():
                if isinstance(v, list):
                    v_str = ", ".join([f"{item.get('class', '')} ({item.get('percentage', '')}%)" if isinstance(item, dict) else str(item) for item in v[:5]])
                elif isinstance(v, dict):
                    v_str = ", ".join([f"{sub_k}: {sub_v}" for sub_k, sub_v in v.items()])
                else:
                    v_str = str(v)
                quant_rows.append([Paragraph(k.replace("_", " ").title(), body_style), Paragraph(v_str, body_style)])
                
            q_table = Table(quant_rows, colWidths=[200, 340])
            q_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0e7ff")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#c7d2fe")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e0e7ff")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(q_table)
            story.append(Spacer(1, 12))
            
        # Auditable Execution Trace
        steps = trace.get("steps", [])
        if steps:
            story.append(Paragraph("<b>Auditable Execution Trace & Tool Pipeline:</b>", h2_style))
            trace_rows = [[
                Paragraph("<b>Stage</b>", bold_body_style),
                Paragraph("<b>Specialist Tool</b>", bold_body_style),
                Paragraph("<b>Observed Action</b>", bold_body_style),
                Paragraph("<b>Latency</b>", bold_body_style)
            ]]
            for s in steps:
                trace_rows.append([
                    Paragraph(s.get("stage", ""), body_style),
                    Paragraph(s.get("tool_name", ""), body_style),
                    Paragraph(s.get("description", ""), body_style),
                    Paragraph(f"{s.get('execution_time_ms', 0):.1f} ms", body_style)
                ])
            t_table = Table(trace_rows, colWidths=[90, 130, 240, 80])
            t_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(t_table)
            story.append(Spacer(1, 12))
            
        # Footer notice
        story.append(Spacer(1, 15))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94a3b8"), spaceAfter=6))
        story.append(Paragraph(
            "<b>SatQuery AI Auditable Geospatial Intelligence</b> | Generated automatically with verifiable model execution traces.",
            ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#64748b"), alignment=TA_CENTER)
        ))
        
        doc.build(story)
        return output_path

    @staticmethod
    def generate_json_report(session_id: str, analysis_result: Dict[str, Any], output_path: Optional[str or Path] = None) -> Path:
        if output_path is None:
            output_path = OUTPUT_DIR / f"SatQuery_Report_{session_id}.json"
        else:
            output_path = Path(output_path)
            
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump({
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "analysis_result": analysis_result
            }, f, indent=2)
            
        return output_path
