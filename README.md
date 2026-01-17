# 🏥 AI Hospital — Multi-Agent Medical Consultation System

> **A full-stack AI-powered virtual hospital** that simulates realistic medical consultations through intelligent agent orchestration, RAG-enhanced diagnostics, and persistent patient records.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![LangGraph](https://img.shields.io/badge/LangGraph-Orchestration-FF6B6B)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-4285F4)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Design](#-database-design)
- [Multi-Agent Workflow](#-multi-agent-workflow)
- [API Design](#-api-design)
- [Knowledge Base & RAG](#-knowledge-base--rag)
- [Getting Started](#-getting-started)

---

## 🎯 Project Overview

AI Hospital is a sophisticated healthcare simulation platform that replicates a real hospital consultation workflow using **multi-agent AI architecture**. The system demonstrates advanced concepts in:

- **Agentic AI Design** — Coordinated multi-agent system with specialized roles
- **Full-Stack Development** — FastAPI backend + React TypeScript frontend  
- **Database Engineering** — PostgreSQL with SQLAlchemy ORM for medical records
- **Real-Time Communication** — Server-Sent Events (SSE) for streaming responses
- **RAG Implementation** — Domain-specific vector stores for evidence-based responses
- **Authentication & Security** — JWT-based auth with secure patient data handling

### How It Works

1. **Patient Registration** — Users create accounts with demographic data stored in PostgreSQL
2. **GP Triage** — AI General Practitioner collects symptoms and routes to appropriate specialist
3. **Specialist Consultation** — Domain expert AI conducts detailed examination with RAG-powered knowledge
4. **Helper Integration** — Specialists can request Pathologist/Radiologist assistance for diagnostics
5. **Report Generation** — Final medical report with diagnosis, treatment plan, and follow-up is persisted to database

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Agent Orchestration** | LangGraph state machine coordinating GP → Specialist → Helper workflows with conditional routing |
| **8 Medical Specialties** | Ophthalmology, Dermatology, ENT, Gynecology, Internal Medicine, Orthopedics, Pediatrics, Psychiatry |
| **Retrieval-Augmented Generation** | ChromaDB vector stores with BGE embeddings for evidence-based medical knowledge retrieval |
| **Real-Time Streaming** | SSE-powered chat with live token streaming and agent transition indicators |
| **Persistent Medical Records** | Full consultation history, lab orders, results, and final reports stored in PostgreSQL |
| **JWT Authentication** | Secure patient authentication with token-based API access |
| **Tool-Augmented Agents** | Custom tools for patient interaction, internet search, RAG retrieval, and report generation |
| **Multilingual Speech Support** | Optional voice I/O supporting Hindi and English via gTTS + SpeechRecognition |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────┐ │
│  │ Auth Forms  │  │  Chat UI     │  │  Agent Status + Tool Feed   │ │
│  │ (Login/     │  │  (SSE Stream │  │  (Real-time agent labels,   │ │
│  │  Signup)    │  │   Consumer)  │  │   tool call visualization)  │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────┬───────────────┘ │
└─────────┼────────────────┼────────────────────────┼─────────────────┘
          │                │                        │
          ▼                ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI + LangGraph)                   │
│                                                                      │
│  ┌──────────────────┐    ┌────────────────────────────────────────┐ │
│  │   Auth Router    │    │         LangGraph State Machine         │ │
│  │  /login          │    │  ┌─────┐    ┌────────────┐    ┌─────┐  │ │
│  │  /users          │    │  │ GP  │───▶│ Specialist │───▶│ END │  │ │
│  │  (JWT tokens)    │    │  └──┬──┘    └─────┬──────┘    └─────┘  │ │
│  └────────┬─────────┘    │     │             │                     │ │
│           │              │     ▼             ▼                     │ │
│           │              │  ┌──────┐    ┌──────────┐               │ │
│           │              │  │Tools │    │ Helpers  │               │ │
│           │              │  └──────┘    │(Path/Rad)│               │ │
│           │              │              └──────────┘               │ │
│           │              └────────────────────────────────────────┘ │
│           │                              │                          │
│           ▼                              ▼                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SQLAlchemy ORM Layer                      │   │
│  │   Patient | Doctor | Consultation | LabOrder | MedicalReport │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────┐          ┌─────────────────────┐
│   PostgreSQL     │          │  ChromaDB Vector    │
│   (Medical       │          │  Stores (9 domains) │
│    Records)      │          │  BGE-large-en-v1.5  │
└──────────────────┘          └─────────────────────┘
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async API framework |
| **LangGraph** | Multi-agent orchestration with stateful graph execution |
| **SQLAlchemy** | ORM for PostgreSQL database operations |
| **PostgreSQL** | Relational database for patient records and consultations |
| **Pydantic** | Data validation and settings management |
| **python-jose** | JWT token creation and verification |
| **SSE-Starlette** | Server-Sent Events for real-time streaming |
| **LangChain** | LLM integrations and tool definitions |
| **ChromaDB** | Vector database for RAG embeddings |
| **HuggingFace** | BGE embedding model for semantic search |
| **Groq API** | Primary LLM (qwen/qwen3-32b) for agent reasoning and RAG |
| **Tavily** | Web search API for supplementary information |
| **MongoDB** | NoSQL database for conversation logs and audit trails |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI with hooks |
| **TypeScript** | Type-safe frontend development |
| **Vite** | Fast build tooling and HMR |
| **EventSource API** | SSE consumption for real-time updates |

---

## 🗄 Database Design

```sql
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    patients     │       │  consultations   │       │    doctors      │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ patient_id (PK) │◄──────│ patient_id (FK)  │       │ doctor_id (PK)  │
│ email           │       │ consultation_id  │       │ name            │
│ password (hash) │       │ status           │       │ specialty       │
│ name            │       │ started_at       │       └─────────────────┘
│ age             │       └────────┬─────────┘
│ gender          │                │
│ created_at      │                │
└─────────────────┘                │
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│    lab_orders     │    │   medical_reports   │    │   lab_results   │
├───────────────────┤    ├─────────────────────┤    ├─────────────────┤
│ order_id (PK)     │    │ report_id (PK)      │    │ result_id (PK)  │
│ consultation_id   │    │ consultation_id(FK) │    │ order_id (FK)   │
│ test_name         │    │ diagnosis           │    │ findings        │
│ status            │    │ treatment           │    └─────────────────┘
└─────────┬─────────┘    └─────────────────────┘
          │
          └──────────────────────────────────────────────────────────────┘
```

### Key Relationships
- **One-to-Many**: Patient → Consultations (patients can have multiple visits)
- **One-to-Many**: Consultation → Lab Orders (multiple tests per consultation)
- **One-to-One**: Lab Order → Lab Result (each test has one result)
- **One-to-One**: Consultation → Medical Report (final report per consultation)

---

## 🤖 Multi-Agent Workflow

### Agent State Management
```python
class AgentState(TypedDict):
    messages: Sequence[BaseMessage]           # GP conversation history
    specialist_messages: Sequence[BaseMessage] # Specialist thread
    patho_messages: Sequence[BaseMessage]     # Pathologist thread
    radio_messages: Sequence[BaseMessage]     # Radiologist thread
    patho_QnA: list[str]                      # Pathologist findings
    radio_QnA: list[str]                      # Radiologist findings
    next_agent: list[str]                     # Agent routing stack
    current_report: list[str]                 # Accumulated report sections
    patient_id: Optional[int]                 # Linked patient record
```

### Routing Logic
```
User Input → GP Node → Router Decision
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   [ask_user]        [tool_call]        [specialist_name]
        │                  │                  │
        ▼                  ▼                  ▼
   Pause Graph        Execute Tool      Route to Specialist
   (await reply)      (Patient_data)    (e.g., Ophthalmology)
                                              │
                                              ▼
                                    Specialist Consultation
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                   [ask_user]            [need helper]        [Final Report]
                        │                     │                     │
                        ▼                     ▼                     ▼
                   Pause Graph          Route to Helper         END Node
                                       (Pathologist/           (persist to DB)
                                        Radiologist)
```

### Custom Tool Definitions
| Tool | Function | Database Impact |
|------|----------|-----------------|
| `ask_user` | Pauses graph execution, sends question to frontend via SSE | None |
| `Patient_data_report` | Compiles GP triage summary | Creates `Consultation` record |
| `VectorRAG_Retrival` | Queries domain-specific ChromaDB store | None |
| `search_internet` | Tavily web search for supplementary info | None |
| `add_report` | Appends findings to consultation | Creates `LabOrder`/`LabResult` or `MedicalReport` |

---

## 🔌 API Design

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/` | Register new patient (returns patient object) |
| `POST` | `/login` | Authenticate and receive JWT token |

### Graph Streaming Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/graph/start/stream` | Start new consultation (SSE stream) |
| `GET` | `/api/graph/resume/stream` | Resume after `ask_user` interruption |

### SSE Event Types
```typescript
// Thread initialization
{ event: "thread", data: { thread_id: string } }

// Agent message (streaming)
{ event: "message", data: { content: string, speaker: string, current_agent: string } }

// Tool execution notification
{ event: "tool", data: { id: string, name: string, args: object, agent: string } }

// User input requested
{ event: "ask_user", data: { question: string, speaker: string } }

// Consultation complete
{ event: "final", data: { message: string } }
```

---

## 📚 Knowledge Base & RAG

### Vector Store Architecture
- **Embedding Model**: `BAAI/bge-large-en-v1.5` (CPU-optimized)
- **Vector Database**: ChromaDB with persistent storage
- **Retrieval**: Top-5 similarity search per query

### Specialty Knowledge Domains
```
backend/vector_stores/
├── Ophthalmologist/    # Eye conditions, treatments
├── Dermatology/        # Skin disorders, dermatological procedures
├── ENT/                # Ear, nose, throat pathologies
├── Gynecology/         # Reproductive health, obstetrics
├── Internal Medicine/  # Systemic diseases, chronic conditions
├── Orthopedics/        # Musculoskeletal disorders
├── Pathology/          # Lab diagnostics, disease markers
├── Pediatrics/         # Child-specific conditions
└── Psychiatry/         # Mental health, behavioral disorders
```

### RAG Query Flow
```
Specialist Agent → VectorRAG_Retrival(query, "Ophthalmologist")
                            │
                            ▼
                   ChromaDB Similarity Search
                            │
                            ▼
                   Top 5 Relevant Chunks
                            │
                            ▼
                   LLM Synthesis (gemini-2.0-flash)
                            │
                            ▼
                   Context-Grounded Response
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- `uv` package manager (or pip)

### Environment Variables
Create `.env` in the backend directory:
```env
DATABASE_HOSTNAME=localhost
DATABASE_PORT=5432
DATABASE_PASSWORD=your_password
DATABASE_NAME=ai_hospital
DATABASE_USERNAME=postgres

SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key    # Optional, for fallback
TAVILY_API_KEY=your_tavily_key
MONGO_URI=mongodb://localhost:27017
```

### Installation

**Backend:**
```bash
cd backend
uv sync                    # or: pip install -r requirements.txt
cd ..
python -m uvicorn backend.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                # Runs on http://localhost:5173
```

### Database Setup
Tables are auto-created on first run via SQLAlchemy. Doctors are seeded automatically with 9 specialists (GP + 8 domain experts).

---

## 📁 Project Structure

```
AI-Hospital/
├── backend/
│   ├── main.py              # FastAPI app, DB init, router mounting
│   ├── api.py               # LangGraph streaming endpoints
│   ├── AI_hospital.py       # Agent definitions, tools, state machine
│   ├── database.py          # SQLAlchemy engine and session
│   ├── models.py            # ORM models (Patient, Consultation, etc.)
│   ├── schemas.py           # Pydantic request/response models
│   ├── oauth2.py            # JWT token utilities
│   ├── config.py            # Pydantic settings from .env
│   ├── mongo_client.py      # MongoDB connection for conversation logs
│   ├── cors_config.py       # CORS middleware configuration
│   ├── utils.py             # Utility functions
│   ├── routers/
│   │   ├── users.py         # Patient registration
│   │   ├── oauth.py         # Login endpoint
│   │   └── history.py       # Patient history with SQL JOINs
│   ├── custom_libs/
│   │   └── Audioconvert.py  # Text-to-speech and speech-to-text
│   ├── Knowledge_notebooks/
│   │   ├── initialize_rag.py    # Vector store loader
│   │   └── vector_rag.ipynb     # RAG creation notebook
│   ├── Knowledge Base/      # Source medical documents
│   └── vector_stores/       # Pre-built ChromaDB stores
│
└── frontend/
    ├── src/
    │   ├── main.tsx         # React entry point
    │   └── ui/
    │       ├── App.tsx      # Main chat application
    │       └── glass.css    # Glassmorphism styling
    ├── package.json
    └── vite.config.ts
```

---

## 📄 License

This project is for educational and demonstration purposes.
