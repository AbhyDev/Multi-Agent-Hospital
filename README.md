# AI Hospital

## How to Run

> [!IMPORTANT]
> - Due to Pushing API key to Git as per instructions, Tavily API key might be disabled by provider, please replace current key in case it does not work: "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" 
> - Clone only the `local_working` branch of the repository (see step 1).
> - If your virtualenv path differs adjust the `source` command accordingly (e.g. `.venv/bin/activate`).
> - Backend runs on port `8000`; frontend default Vite port is `5173`.

1. Clone (only the local_working branch)

```bash
# Clone only the `local_working` branch
git clone --branch local_working --single-branch https://github.com/AbhyDev/AI-Hospital  # clone only the local_working branch
cd AI-Hospital  # change into the repository directory (adjust if your repo name differs)
```

2. Backend:

```bash
# If you haven't cloned above, run the clone command first (see step 1).
cd backend                             # change into the backend directory
uv sync                                # sync/install Python dependencies with 'uv'
source .venv/bin/activate              # activate the virtual environment created by 'uv'
cd ..                                   # return to project root to run the app module
python -m uvicorn backend.main:app --reload --port 8000  # start FastAPI with live reload on port 8000
```

3. Frontend:

```bash
# Install node deps and start the dev server.
cd frontend                            # change into the frontend directory
npm install                            # install frontend dependencies
npm run dev                            # start the Vite dev server (at http://localhost:5173)
```

## Project Description

An AI-powered virtual hospital system that simulates medical consultations using a multi-agent architecture. Patients first interact with a General Practitioner (GP) who triages and routes to specialists (e.g., Ophthalmologist, Dermatologist). Specialists can optionally request assistance from helpers like a Pathologist or Radiologist for advanced diagnostics. The system uses LangGraph for agent orchestration, ChromaDB for retrieval-augmented generation (RAG), and a React frontend for real-time streaming chat.

---

## Table of Contents

1. How to Run
2. Prerequisites
3. Backend Setup
4. Frontend Setup
5. Usage Flow
6. Features
7. Architecture Overview
8. Tools & Agent Behaviors
9. Knowledge Base
10. API Endpoints
11. Extending
12. Notes (Poppler / Tesseract)
13. Dependencies & Requirements
14. License

---

## 1. How to Run

(See top section for the concise commands.)

## 2. Prerequisites

- Python 3.11+ (project uses `uv` for dependency management; you can fall back to `pip install -r requirements.txt` if needed).
- Node.js 18+ (for the React frontend).
- Environment variables in a `.env` file at project root:
  - `GEMINI_API_KEY` (AI model access)
  - `TAVILY_API_KEY` (web search / internet tool)

## 3. Backend Setup

(See top section for the concise commands.)

## 4. Frontend Setup

(See top section for the concise commands.)

## 5. Usage Flow

1. Start backend and frontend.
2. Open the frontend in your browser.
3. Begin a consultation by describing patient symptoms to the GP agent.
4. Flow: GP triage → Specialist routing → (optional) Helper involvement → Final Report generation.
5. Messages stream in real time with speaker labels (GP, Specialist, Helper).

## 6. Features

- **Multi-Agent Consultation Flow**: GP → Specialist → Helper (Pathology/Radiology) when required.
- **Knowledge-Based RAG**: Specialty PDFs embedded and retrieved via Chroma vector stores.
- **Real-Time Streaming**: Server-Sent Events (SSE) with incremental chat updates and role tagging.
- **Supported Specialties**: Ophthalmology, Dermatology, ENT, Gynecology, Internal Medicine, Orthopedics, Pediatrics, Psychiatry.
- **Extensible**: Add new specialists or helpers by mirroring existing LangGraph wiring patterns.
- **Report Assembly**: Structured final medical-style report (diagnosis, plan, follow-up) built via `add_report` tool calls.

## 7. Architecture Overview

### System Topology

- **Backend (`backend/`)**: FastAPI app + LangGraph state machine + CORS config.
- **Orchestrator (`backend/AI_hospital.py`)**: Defines `AgentState`, routing logic, and tool bindings.
- **Frontend (`frontend/`)**: Vite + React SPA consuming SSE for streaming conversations.
- **Knowledge Base**: Pre-built Chroma vector stores in `backend/vector_stores/` sourced from PDFs in `backend/Knowledge Base/`.

### LangGraph Flow Essentials

- `AgentState` maintains multi-stream history, helper Q&A (`patho_QnA`, `radio_QnA`), `next_agent` stack, and `current_report`.
- The GP must (a) interrogate user via `ask_user`, (b) call `Patient_data_report`, then (c) emit the plain specialist name for routing.
- Specialists may call helpers (Pathologist / Radiologist). Their answers fold back into the specialist's thread.
- Completion occurs when a specialist returns a message beginning with `Final Report:`.

## 8. Tools & Agent Behaviors

- `ask_user(question)` – Pauses the graph awaiting patient input.
- `VectorRAG_Retrival(query, agent)` – Retrieves up to 5 high-relevance documents from the specialty vector index for grounded responses.
- `Patient_data_report` – Persists the GP's summarized patient context for downstream specialists.
- `add_report` – Appends structured findings; final call must include diagnosis, treatment plan, and follow-up.
- `search_internet` – Tavily-backed broader web lookup (used when authoritative internal knowledge is insufficient). Prefers `VectorRAG_Retrival` first as they are trained on Medical Books.

## 9. Knowledge Base

Vector stores are already created (no re-initialization required).

- Source PDFs: `backend/Knowledge Base/{specialty}/`
- Ready-to-use embeddings: `backend/vector_stores/{specialty}/`

## 10. API Endpoints

- `POST /api/graph/start/stream` – Start a new consultation thread (streams SSE events).
- `POST /api/graph/resume/stream` – Resume after an `ask_user` tool interruption with patient input.
  SSE Event Types: `thread`, `message`, `ask_user`, `final`.

## 11. Extending

To add a new specialist:

1. Create a system prompt block mirroring existing specialists.
2. Bind required tools (at minimum `ask_user`, `add_report`, and `VectorRAG_Retrival`).
3. Update the GP router logic to emit the new specialist name.
4. Add any `*_AskUser` node name to the `ASK_NODES` list in `backend/api.py`.
5. (If helper interactions needed) integrate with `next_agent` stack management.

## 12. Notes (Poppler / Tesseract)

For a fresh rebuild of vector stores on Windows you would normally install:

1. Poppler (for PDF processing)
2. Tesseract OCR (for scanned PDFs)
   Not required here because all PDFs are already processed and vector stores are pre-built.

### 12.1 Speech-Enabled Notebook (Multilingual)

The notebook at `backend/custom_libs/AI_hospital.ipynb` provides an interactive variant of the system with speech I/O:

- Uses `speech_recognition` + Google Speech to text for microphone input (long pauses supported via higher `pause_threshold`).
- Uses `gTTS` + `pygame` for on-the-fly audio playback (no temp audio files written).
- Current testing focused on Hindi and English; other languages (e.g., Kannada, Punjabi, etc.) can be added by supplying corresponding language codes to `speech_to_text(lang=...)` / `text_to_speech(lang=...)`.
- You can speak in Hindi or English and receive a response rendered back in Hindi (extend logic similarly for additional languages).
- Run the notebook directly if you want a voice-driven consultation loop instead of the web frontend.

Prerequisites for the notebook speech features (install if not already present):

```bash
pip install gTTS pygame SpeechRecognition pyaudio
```

If `pyaudio` wheels are problematic on Windows, use:

```bash
pip install pipwin
pipwin install pyaudio
```

## 13. Dependencies & Requirements

### 13.1 Backend Python Packages

Declared in `backend/pyproject.toml`:

```
fastapi
gtts
langchain
langchain-chroma
langchain-google-genai
langchain-groq
langchain-huggingface
langchain-tavily
langgraph
pygame
python-dotenv
sentence-transformers
speechrecognition
sse-starlette
uvicorn
```

Install via `uv sync` (preferred) or `pip install -r requirements.txt`.

### 13.2 Frontend Packages

Runtime: `react`, `react-dom`
Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`

## 14. License

This project is private and not licensed for public use.
