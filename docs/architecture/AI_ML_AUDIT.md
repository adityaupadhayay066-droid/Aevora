# AEVORA (TravelIQ) — AI/ML & RAG Reliability Audit

**Audit Date:** 2026-11-26  
**Scope:** `Ai travel assistant/ai-services/` (`main.py`, `rag_engine.py`, `routing.py`, `train_models.py`, `data_cleaner.py`, `generate_data.py`, `ai_engine/*.py`, `models/*.json`), Express AI/Agentic bridges (`aiService.js`, `aiController.js`, `chatbotController.js`, `agentController.js`, `ragController.js`), and frontend AI surfaces (`AgenticPlannerPage.jsx`, `RAGSearchPage.jsx`, `AIChatbot.jsx`).

---

## 1. Confirmed AI/ML & RAG Defects

### `AI-001` — 100% Synthetic Training Data & Severely Broken Feature Skew Between Training and Serving
- **Severity:** Critical
- **Affected File & Line:**
  - `Ai travel assistant/ai-services/train_models.py:63-359,405-412,598,623,671,703`
  - `Ai travel assistant/ai-services/data_cleaner.py:197,202-203`
  - `Ai travel assistant/ai-services/main.py:225,406-418,454-465,510,556,595,1151-1157`
  - `Ai travel assistant/ai-services/generate_data.py:9-80`
- **Actual Technical Problem:**
  1. All 8 models record `"dataset_provenance": "synthetic_simulation"` in `models/model_metrics.json`. `generate_data.py` writes an unused `data/travel_dataset.csv` with an incompatible schema.
  2. **Catastrophic Train–Serving Feature Mismatches:**
     - `crowd_model`: Trained dividing *both* `day_of_week` (`0..6`) and `hour_of_day` by `24.0`; serving divides `day_of_week` (`1..7`) by `7.0` (`main.py:510`).
     - `occupancy_model`: Trained dividing `month`, `day_of_week` (`0..6`), `season_code` all by `12.0`; serving divides by `12.0`, `7.0`, and `4.0` (`main.py:556`).
     - `delay_model`: Trained on `["Sunny", "Rainy", "Foggy", "Overcast"]` (`"Foggy"` -> index `0`). Serving defaults `weather="Clear"`, catches `LabelEncoder.transform` `ValueError`, and falls back to `0`—mapping `"Clear"` directly to `"Foggy"` (worst delay)! Unknown labels map to `0` across all endpoints instead of the reserved `len(le.classes_)` unknown slot (`train_models.py:410`).
     - `fare_model`: Trained on full `station_name` strings of the first 20 entries of `unique_stations.json`, while serving sends uppercase station codes (`"NDLS"`, `"CNB"`), causing 100% vocabulary misses.
     - `route_recommender`: Trained on `cost / 5000.0`, `duration / 48.0`, clipped `[0, 1]` (`data_cleaner.py:197`); serving (`main.py:595`) passes raw unscaled `cost=1200.0`, `duration=8.5`, `eco=4.5`.
     - `behavior_net`: `data_cleaner.py:202-203` clips `pref_mode` (`0..3`) to `[0.0, 1.0]` during training, while serving feeds unclipped `0..3`.
- **Recommended Solution:** Separate synthetic vs real datasets, unify feature preprocessing/scaling/vocabularies into one shared deterministic transform library saved as JSON config alongside model weights, and map unseen categories to `unknown_idx`.
- **Implementation Status:** Open (Confirmed)

### `AI-002` — Degraded Models Deployed Without Gates, Missing Val Splits & Buggy `test_loss`
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/ai-services/models/model_metrics.json:2-117`, `Ai travel assistant/ai-services/train_models.py:429,464-489,642,655,722,735`
- **Actual Technical Problem:**
  1. **No validation split** exists (only 80/20 train/test).
  2. **`occupancy_model`** achieves `38.75%` accuracy vs `46.5%` majority baseline (`"beats_majority_baseline": false`); **`behavior_net`** gets `42.0%` accuracy / `0.1655` macro-F1; **`crowd_model`** gets `49.0%` accuracy / `0.2724` macro-F1; **`delay_model`** shows `53.26` min MAE / `87.68` min RMSE.
  3. **Logging bug:** `crowd_model` (`:642,655`) and `occupancy_model` (`:722,735`) log the final **training batch loss** (`total_loss.item()`) as `'test_loss'`. Regression models lack R², and classifiers lack Precision, Recall, and ROC-AUC.
  4. **Misleading Naming:** `TrainDelayLSTM` (`ai_engine/delay_model.py`) and `SmartFareLSTM` (`ai_engine/fare_model.py`) are tabular MLPs with zero LSTM layers.
- **Recommended Solution:** Implement proper train/val/test splits, compute complete metrics (MAE, RMSE, R²; Precision, Recall, F1, ROC-AUC), evaluate `test_loss` on the held-out test split, enforce minimum baseline-beating quality gates before saving weights, and use accurate model names or gradient-boosted trees for tabular predictions.
- **Implementation Status:** Open (Confirmed)

### `AI-003` — Broken RAG Vector Space, Query-Time Full-DB Re-Fit & Cross-Container Failure
- **Severity:** Critical
- **Affected File & Line:**
  - `Ai travel assistant/ai-services/rag_engine.py:89-99,118-174,265-358`
  - `Ai travel assistant/ai-services/main.py:1318-1388`
  - `Ai travel assistant/backend/controllers/ragController.js:74,89,143-205`
  - `Ai travel assistant/backend/routes/ragRoutes.js:31`
- **Actual Technical Problem:**
  1. **Container Upload Breakage:** Express writes uploaded files to local container disk (`uploads/rag/`) and passes `file_path` to FastAPI (`main.py:1387` checks `os.path.exists`), failing in multi-container Docker (`docker-compose.loadbalance.yml`) or separate Render services. Moreover, `ragRoutes.js:31` allows `.md` while `main.py:1370` rejects `.md`.
  2. **Vector Corruption & O(N) Re-Fit:** `rag_engine.py` uses a 128-dim TF-IDF vectorizer (`max_features=128`), re-fits on the entire DB table on every `/rag/query` (`:265-276`), runs row-by-row `UPDATE`s on upload without locking, and **`ragController.deleteDocument` (`:168-174`) deletes chunks without updating remaining embeddings**—causing vocabulary/dimension drift between stored vectors and query-time `TfidfVectorizer`.
  3. **Filename Collision & Broken Truncate:** `rag_engine.py:118` resolves `knowledge_documents` by non-unique `filename` instead of `document_id`; `ragController.js:188` calls `Embedding.destroy({ truncate: { cascade: true } })` which MySQL rejects on FK-linked tables.
- **Recommended Solution:** Transfer document contents or multipart file bytes via HTTP to `/rag/upload`, pass `document_id`, switch to a fixed-dimension embedding space (so additions/deletions never shift existing vectors), replace `TRUNCATE` with transactional `DELETE`, and cache vector matrices with version invalidation.
- **Implementation Status:** Open (Confirmed)

### `AI-004` — Hallucinated Outputs, Fabricated `/copilot/query`, & `/chat` Bypassing RAG
- **Severity:** High
- **Affected File & Line:**
  - `Ai travel assistant/ai-services/main.py:436-613,1066-1096,1540-1570`
  - `Ai travel assistant/ai-services/rag_engine.py:192-197,302-351`
  - `Ai travel assistant/backend/controllers/{aiController,agentController}.js`
  - `Ai travel assistant/frontend/src/{pages/RAGSearchPage.jsx,components/AIChatbot.jsx}`
- **Actual Technical Problem:**
  1. `/copilot/query` (`main.py:1540-1570`) returns 100% hardcoded values (`1850.0` fare, `24.5 vs 165.2 kg CO2`, `delay_risk_score: 12.0`, `"Local Food Vendor"`, `"Verified Station Hotel"` at `1800`).
  2. `/chat` (`main.py:1066-1096`) executes `generate_gemini_response` **before** `generate_expert_traveliq_response` and `query_rag_engine`, bypassing RAG grounding whenever Gemini responds.
  3. `rag_engine.py:302-351` invokes Gemini even when `retrieved_chunks == []`, forces `"confidence": 94.0`, lacks `temperature=0.0` or chunk citation verification, and keeps a hardcoded `"kolkata"` sightseeing branch (`confidence: 92.00`).
  4. `aiController.js:27-95` persists static fallback predictions (`aiService.js:107-212`) into `DelayPrediction`, `FareForecast`, `CrowdPrediction`, and `OccupancyPrediction` MySQL tables as if real; `agentController.js:238-375` returns hardcoded trip telemetry (`14h 30m`, `1280 km`, `27°C`, `9.6/10`); and `main.py` regression heads (`StationCrowdNet`, `TrainOccupancyNet`) lack `[0, 100]` output clamping.
- **Recommended Solution:** Abstain/refuse when RAG returns zero verified chunks above similarity threshold; require chunk citation tags and `temperature=0.0`; ground `/chat` in DB + RAG *before* LLM synthesis; remove hardcoded `/copilot/query` and `agentController` telemetry; clamp model outputs; and never write fallback mock values into authoritative DB tables.
- **Implementation Status:** Open (Confirmed)

### `AI-005` — Partial `/retrain-with-data` Crashes & Leaves `data_quality_report.json` Empty
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/ai-services/main.py:1194-1248`, `train_models.py:369-398,982`, `models/data_quality_report.json:1-5`
- **Actual Technical Problem:** Sending a single model dataset or empty records to `/retrain-with-data` causes `train_and_save_all` to overwrite `data_quality_report.json` with `"summary": {}` and raise `KeyError` on missing datasets. `background_retrain_task` restores only `.pth` files on error, leaving `encoders.pkl` and JSON metrics desynchronized.
- **Recommended Solution:** Support per-model selective retraining, reject empty training lists via Pydantic validation, and swap all artifacts (`.pth`, preprocessing configs, metrics JSON) atomically via a temporary staging directory.
- **Implementation Status:** Open (Confirmed)

### `AI-006` — `routing.py` Substring Coordinate Collision (`'R'` -> Raipur) & Model Lock Races
- **Severity:** High
- **Affected File & Line:** `Ai travel assistant/ai-services/routing.py:1,31,105-112`, `Ai travel assistant/ai-services/main.py:99,174-184,401-606`
- **Actual Technical Problem:**
  1. `routing._resolve_coords` checks `if k in clean or clean in k` where `STATION_COORDS` contains single-letter `'R'` (Raipur), mapping `"AMRITSAR"`, `"JAIPUR"`, and `"SURAT"` to Raipur coordinates!
  2. `load_all_models()` acquires `model_swap_lock` when updating 9 global model/encoder references, but inference routes read those globals without locking or an immutable snapshot bundle.
  3. `/health` only verifies `model_delay is not None` and returns `200 OK` even when the other 7 models or `encoders.pkl` failed to load.
- **Recommended Solution:** Remove substring fallback in `_resolve_coords` (use exact station code/name lookup), store loaded models + preprocessing config in an immutable `ModelBundle` swapped atomically, and report per-model readiness in `/health` / `/ready` (`503` if degraded).
- **Implementation Status:** Open (Confirmed)

### `AI-007` — Unpinned `requirements.txt`, Missing `httpx`, & Multi-GB CUDA Bloat in `Dockerfile`
- **Severity:** Medium
- **Affected File & Line:** `Ai travel assistant/ai-services/requirements.txt:1-15`, `Ai travel assistant/ai-services/Dockerfile:1-23`
- **Actual Technical Problem:** Dependencies use loose `>=` ranges; `httpx` (used by tests) is omitted while `pytest` is installed in prod; and `Dockerfile` installs CUDA-enabled `torch` on CPU-only `python:3.11-slim` without a `HEALTHCHECK` or `unique_stations.json` access.
- **Recommended Solution:** Pin exact dependency versions (separate `requirements-dev.txt`), install CPU-only PyTorch wheels, add `HEALTHCHECK`, align Python runtime version, and load station masters from MySQL rather than local relative JSON paths.
- **Implementation Status:** Open (Confirmed)

---

## 2. Potential AI/ML Architectural Risks

1. **Lack of Data Drift & Latency Telemetry:** Prediction latency, feature distribution drift, and confidence calibration are neither exported as metrics nor monitored in production.
2. **Ephemeral Unbounded `USER_MEMORIES` (`main.py:1499`):** Conversational state disappears on restart and splits across multiple FastAPI replicas.
3. **Unescaped MySQL DSN Interpolation (`rag_engine.py:18`):** Using f-strings instead of `sqlalchemy.engine.URL.create` breaks if `DB_PASSWORD` contains URL-reserved characters (`@`, `:`, `/`, `#`).
