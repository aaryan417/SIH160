from app.models import ClassificationResult, SecurityAssessment


def build_report_payload(classification: ClassificationResult, assessment: SecurityAssessment, report_type: str) -> dict:
    """Assembles the JSON body a PDF/HTML renderer would consume.

    Keep this pure (no I/O) so it's trivial to unit test — the actual
    PDF/HTML rendering belongs in a separate renderer you plug in later.
    """
    base = {
        "report_type": report_type,
        "session_id": str(classification.session_id),
        "predicted_cipher": classification.predicted_cipher,
        "predicted_mode": classification.predicted_mode,
        "confidence_score": classification.confidence_score,
        "risk_score": assessment.risk_score,
        "compliance_status": assessment.compliance_status,
    }

    if report_type == "technical":
        base["predicted_dh_group"] = classification.predicted_dh_group

    return base
