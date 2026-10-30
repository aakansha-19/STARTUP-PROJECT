import io
import csv
import html
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def generate_csv_report(analysis: Dict[str, Any]) -> str:
    """
    Generates a structured CSV report string containing complete analysis metrics,
    matched skills, missing skills, suggestions, and learning recommendations.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["AI PLACEMENT READINESS PREDICTOR - STUDENT ANALYSIS REPORT"])
    writer.writerow([])
    writer.writerow(["Section", "Field", "Value"])
    writer.writerow(["Overview", "Analysis ID", analysis.get("id")])
    writer.writerow(["Overview", "Candidate Name", analysis.get("candidate_name")])
    writer.writerow(["Overview", "File Analyzed", analysis.get("filename")])
    writer.writerow(["Overview", "Target Job Role", analysis.get("target_role_title")])
    writer.writerow(["Overview", "Generated At", analysis.get("created_at")])
    writer.writerow([])

    writer.writerow(["Evaluation", "Readiness Score", f"{analysis.get('readiness_score')}/100"])
    writer.writerow(["Evaluation", "Readiness Level", analysis.get("readiness_level")])
    writer.writerow(["Evaluation", "Skill Match Percentage", f"{analysis.get('skill_match_percentage')}%"])
    writer.writerow(["Evaluation", "CGPA Evaluated", analysis.get("cgpa") if analysis.get("cgpa") else "Baseline (7.0 default applied)"])
    writer.writerow(["Evaluation", "Project Count", analysis.get("project_count")])
    writer.writerow(["Evaluation", "Internship Count", analysis.get("internship_count")])
    writer.writerow(["Evaluation", "Benchmark ML Probability", f"{analysis.get('ml_placement_probability')}%" if analysis.get("ml_placement_probability") is not None else "N/A"])
    writer.writerow(["Evaluation", "ML Evaluation Notice", analysis.get("ml_status")])
    writer.writerow([])

    breakdown = analysis.get("score_breakdown", {})
    writer.writerow(["Score Breakdown Component", "Earned Points", "Maximum Points"])
    writer.writerow(["Skill Match Score", breakdown.get("skill_match_score", 0), breakdown.get("skill_match_max", 50)])
    writer.writerow(["Projects Score", breakdown.get("projects_score", 0), breakdown.get("projects_max", 20)])
    writer.writerow(["Internships Score", breakdown.get("internships_score", 0), breakdown.get("internships_max", 15)])
    writer.writerow(["Academic Standing Score", breakdown.get("academics_score", 0), breakdown.get("academics_max", 15)])
    writer.writerow([])

    writer.writerow(["Skills Analysis", "Type", "Skills List"])
    writer.writerow(["Skills Analysis", "Extracted From Resume", ", ".join(analysis.get("extracted_skills", []))])
    writer.writerow(["Skills Analysis", "Matched For Target Role", ", ".join(analysis.get("matched_skills", []))])
    writer.writerow([])

    writer.writerow(["Missing Skills & Priorities", "Skill Name", "Importance", "Priority Rank"])
    for item in analysis.get("missing_skills", []):
        writer.writerow(["Missing Skill", item.get("skill"), item.get("importance"), item.get("learning_priority")])
    writer.writerow([])

    writer.writerow(["Personalized Recommendations", "Skill", "Course Name", "Provider", "URL", "Project Idea"])
    for rec in analysis.get("recommendations", []):
        writer.writerow([
            "Learning Recommendation",
            rec.get("skill"),
            rec.get("course_name"),
            rec.get("provider"),
            rec.get("course_url"),
            rec.get("project_idea")
        ])
    writer.writerow([])

    writer.writerow(["Improvement Plan", "Step Number", "Recommendation"])
    for idx, sug in enumerate(analysis.get("improvement_suggestions", []), 1):
        writer.writerow(["Action Item", idx, sug])

    return output.getvalue()


def generate_pdf_report(analysis: Dict[str, Any]) -> bytes:
    """
    Generates a professional PDF document with styled tables, visual metrics,
    and structured recommendations using ReportLab.
    """
    if not REPORTLAB_AVAILABLE:
        # Fallback to UTF-8 encoded text representation if ReportLab is missing
        return generate_csv_report(analysis).encode("utf-8")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )
    
    subhead_style = ParagraphStyle(
        'SubHeader',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )

    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )

    story = []

    # Title & Subheading
    story.append(Paragraph("AI Placement Readiness Report", header_style))
    safe_role = html.escape(str(analysis.get('target_role_title') or 'General Role'))
    safe_name = html.escape(str(analysis.get('candidate_name') or 'Student'))
    created_at_raw = analysis.get('created_at')
    safe_date = str(created_at_raw)[:10] if created_at_raw else 'Recent'
    story.append(Paragraph(
        f"Target Role: <b>{safe_role}</b> | "
        f"Candidate: <b>{safe_name}</b> | "
        f"Date: {safe_date}",
        subhead_style
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=12))

    # Executive Summary Card Table
    summary_data = [
        [
            Paragraph("<b>Readiness Score</b>", body_style),
            Paragraph(f"<font size=14 color='#1D4ED8'><b>{analysis.get('readiness_score')}/100</b></font><br/>{analysis.get('readiness_level')}", body_style),
            Paragraph("<b>Skill Match</b>", body_style),
            Paragraph(f"<font size=14 color='#7C3AED'><b>{analysis.get('skill_match_percentage')}%</b></font><br/>Requirements Satisfied", body_style),
        ],
        [
            Paragraph("<b>Evaluated CGPA</b>", body_style),
            Paragraph(str(analysis.get('cgpa') or "7.0 (Baseline)"), body_style),
            Paragraph("<b>Projects & Experience</b>", body_style),
            Paragraph(f"{analysis.get('project_count')} Projects | {analysis.get('internship_count')} Internships", body_style),
        ]
    ]
    summary_table = Table(summary_data, colWidths=[110, 150, 110, 150])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 12))

    # Score Breakdown Table
    story.append(Paragraph("Score Factor Breakdown (Transparent Heuristic Formula)", section_style))
    breakdown = analysis.get("score_breakdown", {})
    breakdown_data = [
        ["Factor", "Weight Contribution", "Max Weight", "Status / Notes"],
        ["Skill Match", f"{breakdown.get('skill_match_score', 0)} pts", "50 pts", "Based on required and preferred skills"],
        ["Projects", f"{breakdown.get('projects_score', 0)} pts", "20 pts", f"{analysis.get('project_count', 0)} completed projects"],
        ["Internships", f"{breakdown.get('internships_score', 0)} pts", "15 pts", f"{analysis.get('internship_count', 0)} industry internships"],
        ["Academics", f"{breakdown.get('academics_score', 0)} pts", "15 pts", str(breakdown.get("academics_note", "Standard baseline"))],
    ]
    breakdown_table = Table(breakdown_data, colWidths=[120, 110, 90, 200])
    breakdown_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#FFFFFF')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(breakdown_table)
    story.append(Spacer(1, 10))

    # Matched vs Missing Skills
    story.append(Paragraph("Skills Analysis", section_style))
    matched_text = ", ".join(analysis.get("matched_skills", [])) or "None identified yet"
    missing_items = [f"{m.get('skill')} ({m.get('importance')})" for m in analysis.get("missing_skills", [])]
    missing_text = ", ".join(missing_items) or "All role requirements covered!"

    skills_data = [
        [Paragraph("<b>Matched Skills</b>", body_style), Paragraph(matched_text, body_style)],
        [Paragraph("<b>Skills To Acquire</b>", body_style), Paragraph(missing_text, body_style)],
    ]
    skills_table = Table(skills_data, colWidths=[130, 390])
    skills_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F1F5F9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(skills_table)
    story.append(Spacer(1, 10))

    # Recommendations
    story.append(Paragraph("Priority Learning & Project Recommendations", section_style))
    rec_rows = [["Priority", "Skill", "Recommended Resource", "Provider", "Hands-on Project Idea"]]
    for rec in analysis.get("recommendations", [])[:5]:
        rec_rows.append([
            str(rec.get("priority")),
            rec.get("skill"),
            Paragraph(f"<b>{rec.get('course_name')}</b><br/>{rec.get('course_url')}", body_style),
            rec.get("provider"),
            Paragraph(rec.get("project_idea", ""), body_style)
        ])
    rec_table = Table(rec_rows, colWidths=[40, 70, 160, 90, 160])
    rec_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4338CA')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(rec_table)
    story.append(Spacer(1, 10))

    # Resume Improvement Suggestions
    story.append(Paragraph("Actionable Resume Improvement Plan", section_style))
    for idx, sug in enumerate(analysis.get("improvement_suggestions", []), 1):
        story.append(Paragraph(f"• <b>Step {idx}:</b> {sug}", body_style))
        story.append(Spacer(1, 4))

    # ML Disclaimer Footer
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94A3B8'), spaceAfter=6))
    notice_text = (
        "<i>Academic & Institutional Notice: Readiness scores represent a transparent heuristic model "
        "designed for student preparation guidance. The placement probability pipeline is trained on "
        "synthetic benchmark data for demonstration and must be calibrated with authentic university records.</i>"
    )
    story.append(Paragraph(notice_text, subhead_style))

    doc.build(story)
    return buffer.getvalue()
