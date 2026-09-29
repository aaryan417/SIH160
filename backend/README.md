# SIH26160 — AI-Powered IPsec VPN Protocol Analyzer (backend scaffold)

Matches the flowchart / architecture / class / ER diagrams: testbed config →
capture → parse → classify → assess → report, backed by PostgreSQL.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # then edit DATABASE_URL if needed
createdb vpn_analyzer  # or use your existing Postgres instance

uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for interactive Swagger docs.

## API flow (mirrors the flowchart)

1. `POST /testbed/configurations` — register a VPN config (mode, cipher,
   DH group, PFS, IP version) that matches what you actually stood up in
   your lab (strongSwan/Libreswan).
2. `POST /capture/sessions/{config_id}` — upload the pcap captured for
   that config (Wireshark/tcpdump export). `GET /capture/sessions` lists
   every session across all configs.
3. `POST /classify/{session_id}?local_ip=<your test rig's IP>` — runs
   feature extraction + the classifier, stores the predicted cipher/mode.
4. `POST /assess/{session_id}` — runs the rule-based risk scoring against
   the classifier's output and the known config.
5. `POST /reports/{session_id}?report_type=executive|technical` — creates
   a report record; wire your own PDF/HTML renderer onto
   `report_generator.build_report_payload`.

## What's stubbed vs. real

- **Real**: pcap parsing (scapy), DB schema, all five endpoints, rule-based
  risk scoring.
- **Stubbed — needs your work**: `protocol_classifier.py` falls back to a
  crude heuristic when no trained model exists at `MODEL_PATH`. You need to:
  1. Stand up the testbed (multiple IPsec configs per the PS brief).
  2. Capture labeled traffic per config.
  3. Write a `scripts/train.py` that calls `extract_features()` across many
     labeled captures, trains a classifier (start with
     `RandomForestClassifier`, multiclass on `"cipher|mode|dh_group"`
     labels), and saves it with `joblib.dump()` to `MODEL_PATH`.
  4. `_model_predict()` in `protocol_classifier.py` already expects that
     exact label format — no other code changes needed once the model exists.
- **Not built here**: PDF/HTML report rendering, the React dashboard, auth.
  Ask when you're ready for any of these.

## Known simplifications to revisit

- `ClassificationResult` and `SecurityAssessment` are 1:1 with a capture
  session. If you want to re-run with a new model version against the same
  capture, relax the `unique=True` constraint on `session_id` in
  `app/models/__init__.py`.
- IKE version parsing in `packet_parser.py` is best-effort byte offset
  reading — validate against real IKEv2 captures before trusting it.
