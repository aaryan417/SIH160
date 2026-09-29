"""AI classification engine.

The traffic itself is encrypted, so the model never sees plaintext — it
learns from side-channel metadata: packet size distributions, inter-arrival
timing, ESP overhead patterns, and IKE exchange counts. This is a metadata/
side-channel classification problem, not payload inspection.

This module ships a heuristic fallback so the API is runnable before you've
trained a real model. Swap `_heuristic_predict` for `_model_predict` once
`train.py` (to be added under scripts/) has produced a joblib file at
settings.model_path.
"""

import os
import statistics
from dataclasses import dataclass

# import joblib
import numpy as np

from app.config import settings
from app.services.packet_parser import ParsedCapture

FEATURE_NAMES = [
    "esp_packet_count",
    "ike_packet_count",
    "ah_packet_count",
    "mean_packet_length",
    "stdev_packet_length",
    "mean_inter_arrival",
]


@dataclass
class ClassificationOutput:
    predicted_cipher: str
    predicted_mode: str
    predicted_dh_group: str | None
    confidence_score: float


def extract_features(capture: ParsedCapture) -> np.ndarray:
    counts = capture.counts_by_protocol()
    lengths = [p.length for p in capture.packets]
    timestamps = sorted(p.timestamp for p in capture.packets)
    inter_arrivals = [t2 - t1 for t1, t2 in zip(timestamps, timestamps[1:])]

    features = [
        counts.get("ESP", 0),
        counts.get("IKE", 0),
        counts.get("AH", 0),
        statistics.mean(lengths) if lengths else 0.0,
        statistics.pstdev(lengths) if len(lengths) > 1 else 0.0,
        statistics.mean(inter_arrivals) if inter_arrivals else 0.0,
    ]
    return np.array(features, dtype=float).reshape(1, -1)


def _heuristic_predict(features: np.ndarray, capture: ParsedCapture) -> ClassificationOutput:
    """Rule-of-thumb fallback used until a trained model is available.

    ESP with no AH and a high average packet length skews towards AES-GCM
    (combined encrypt+auth, no separate ICV overhead pattern from HMAC).
    This is intentionally crude — replace it once you have labeled data
    from the testbed described in the flowchart.
    """
    counts = capture.counts_by_protocol()
    mean_len = float(features[0][3])

    if counts.get("AH", 0) > 0:
        cipher = "AES-CBC+HMAC"
    elif mean_len > 150:
        cipher = "AES-GCM"
    else:
        cipher = "AES-128"

    mode = "tunnel" if mean_len > 120 else "transport"

    return ClassificationOutput(
        predicted_cipher=cipher,
        predicted_mode=mode,
        predicted_dh_group=None,
        confidence_score=0.55,  # heuristic outputs are capped below "confident"
    )


def _model_predict(features: np.ndarray) -> ClassificationOutput:
    import joblib
    model = joblib.load(settings.model_path)
    proba = model.predict_proba(features)[0]
    pred_idx = int(np.argmax(proba))
    label = model.classes_[pred_idx]
    cipher, mode, dh_group = label.split("|")
    return ClassificationOutput(
        predicted_cipher=cipher,
        predicted_mode=mode,
        predicted_dh_group=dh_group,
        confidence_score=float(proba[pred_idx]),
    )


def classify(capture: ParsedCapture) -> ClassificationOutput:
    features = extract_features(capture)
    if os.path.exists(settings.model_path):
        return _model_predict(features)
    return _heuristic_predict(features, capture)
