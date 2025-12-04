# AI-Hospital Copilot Playbook

## System topology
- **Backend (`backend/main.py`)** boots FastAPI, wires the router from `backend/api.py`, and applies CORS from `cors_config.py`.
- **LangGraph orchestrator (`backend/AI_hospital.py`)** defines `AgentState`, tool bindings, and the `myapp` state graph that routes between GP, specialists, and helpers.
- **Frontend (`frontend/src/ui/App.tsx`)** is a Vite/React SPA that streams chat over SSE and highlights speakers for GP, specialists, and helpers.
- **Knowledge base** loads persistent Chroma stores from `backend/vector_stores/{specialty}` via `Knowledge_notebooks/initialize_rag.py`, seeded from PDFs in `backend/Knowledge Base/`.

## LangGraph flow essentials
- `AgentState` tracks per-stream histories plus `patho_QnA`, `radio_QnA`, `next_agent`, and `current_report`; always update these when adding new routes.
- The GP agent must interrogate via `ask_user`, then call `Patient_data_report` before emitting the bare specialist name that `router_gp` consumes.
- Specialist routers append helper questions to `patho_QnA`/`radio_QnA`, capture `add_report` payloads into `current_report`, and only exit once `Final Report:` is returned.
- Helpers echo their findings back into the requesting specialist stream; use the `next_agent` stack so responses route correctly.

## Tool usage patterns
- `ask_user(question)` is intercepted by API: trigger it for every patient-facing question and expect the reply as a `ToolMessage` on resume.
- `VectorRAG_Retrival(query, agent)` expects the canonical specialist label (e.g., "Ophthalmologist"); it pulls from the matching Chroma retriever with `k=5` docs.
- `Patient_data_report` persists the GP summary in the `patient_info` global that specialists read; never bypass this when adding new entry flows.
- `add_report` accumulates findings in `current_report`; the final tool call must contain diagnosis, treatment plan, and follow-up before emitting `Final Report:`.

## Frontend ⇄ backend contract
- `/api/graph/start/stream` and `/api/graph/resume/stream` stream LangGraph values; messages are normalized by `_chunk_to_payload` to suppress routing tokens.
- `ASK_NODES` in `backend/api.py` must list every `*_AskUser` node so the SSE layer can pause and surface `ask_user` prompts.
- SSE events: `thread` (thread id), `message` (speaker-tagged text), `ask_user` (pending tool call, includes question on resume), `final` (last assistant text).
- The React client in `App.tsx` relies on consistent speaker tags and duplicate suppression; preserve these when changing payload formats.

## Developer workflows
- Backend: create a `.env` with `GEMINI_API_KEY` and `TAVILY_API_KEY`, then `uv sync` (or `pip install -r requirements.txt`) and run `uv run uvicorn backend.main:app --reload`.
- Frontend: `cd frontend`, `npm install`, `npm run dev`; proxy `/api` to the backend or set `VITE_API_BASE`.
- Vector stores: drop PDFs into `backend/Knowledge Base/{specialty}` and re-run `backend/Knowledge_notebooks/vector_rag.ipynb` to refresh `backend/vector_stores/`.
- Notebook-heavy tasks default to CPU HuggingFace embeddings (`BAAI/bge-large-en-v1.5`); ensure the model assets are reachable when deploying.

## Extending the graph safely
- New specialists require a system prompt block, a router function, and graph wiring—mirror existing patterns and remember to update `router_gp`, `ASK_NODES`, and any `interrupt_before` lists.
- Keep helper invocation phrases explicit ("Pathologist" / "Radiologist") so keyword routing continues to work.
- When altering state keys or finalization logic, adjust `_last_assistant_text`/`_chunk_to_payload` to keep SSE output consistent, and update the frontend speaker map if new roles appear.
