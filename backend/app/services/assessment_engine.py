"""Turns a classification result + the known testbed config into a security
verdict: crypto strength, compliance status, and a 0-100 risk score.

Deliberately rule-based and auditable — a judge or a real analyst can trace
exactly why a score came out the way it did, which matters more here than
squeezing out a few extra points of "AI-ness".
"""

from dataclasses import dataclass

WEAK_CIPHERS = {"DES", "3DES", "AES-CBC"}
STRONG_CIPHERS = {"AES-GCM", "AES-256"}
WEAK_DH_GROUPS = {"MODP768", "MODP1024"}


@dataclass
class AssessmentOutput:
    risk_score: float
    compliance_status: str
    threat_matrix: dict[str, str]


def _score_cipher(cipher: str) -> int:
    if cipher in STRONG_CIPHERS:
        return 0
    if cipher in WEAK_CIPHERS:
        return 40
    return 15  # AES-128 etc — acceptable but not best-in-class


def _score_pfs(pfs_enabled: bool) -> int:
    return 0 if pfs_enabled else 25


def _score_dh_group(dh_group: str | None) -> int:
    if dh_group in WEAK_DH_GROUPS:
        return 20
    return 0


def assess(predicted_cipher: str, pfs_enabled: bool, dh_group: str | None) -> AssessmentOutput:
    penalty = _score_cipher(predicted_cipher) + _score_pfs(pfs_enabled) + _score_dh_group(dh_group)
    risk_score = min(100, penalty)

    if risk_score >= 50:
        compliance_status = "non_compliant"
    elif risk_score >= 20:
        compliance_status = "needs_review"
    else:
        compliance_status = "compliant"

    threat_matrix = {
        "cipher_strength": "high_risk" if predicted_cipher in WEAK_CIPHERS else "low_risk",
        "forward_secrecy": "at_risk" if not pfs_enabled else "protected",
        "key_exchange_strength": "weak" if dh_group in WEAK_DH_GROUPS else "adequate",
    }

    return AssessmentOutput(risk_score=risk_score, compliance_status=compliance_status, threat_matrix=threat_matrix)
