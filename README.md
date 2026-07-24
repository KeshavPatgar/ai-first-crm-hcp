<div align="center">
  <h1>🚀 AI-First CRM & QA Module</h1>
  <p><strong>An AI-powered, production-ready enterprise application designed specifically for pharmaceutical field representatives, Healthcare Professionals (HCP), and Quality Assurance (QA) Teams.</strong></p>
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
  ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

---

The application utilizes an **AI-First UX split-screen architecture** to handle dual workflows:

1. **HCP CRM Interactions:** Shifts the data-entry burden from the representative to the machine by letting an intelligent AI Assistant handle all operational state mutations dynamically via natural language processing.
2. **QA & Complaints Intake:** Automates the ingestion, parsing, and risk assessment of defective medication complaints from hospitals via direct document uploads or pasted emails.

## ✨ Key Features

### 🩺 HCP Interaction Module
- 🤖 **AI-Powered Interaction Logging:** Converts messy text into clean entity extraction instantly.
- 🔄 **State Memory Delta Corrections:** Targets and mutates explicit fields via conversational history context while perfectly preserving adjacent data points.
- 💬 **ChatGPT-Style Fallback Flexibility:** Gracefully answers general conversational text while executing backend logic simultaneously.

### ⚠️ QA & Complaints Module
- 📄 **Intelligent Document Parsing:** Drag and drop PDF, DOCX, TXT, or EML files for instant, automated data extraction into the QMS (Quality Management System) form.
- 🚨 **AI Risk Assessment:** Automatically evaluates the severity of the complaint (Minor, Major, Critical), assigns a confidence score, and suggests immediate preventative actions.
- 🔬 **Root Cause & CAPA Generation:** Automatically analyzes the defect to recommend likely manufacturing root causes and suggests comprehensive Corrective and Preventive Actions (CAPA).

### 🛠 System Architecture
- 🧠 **LangGraph Orchestration:** Dual compiled state graphs utilizing the high-speed `llama-3.1-8b-instant` model via Groq for fast, accurate tool calling and decision routing.
- 📝 **Zero-Hardcoding Payload Extraction:** Uses dynamic Python dictionary unpacking to extract entities seamlessly.
- ⚙️ **Real-Time UI Synchronization:** Leverages Redux Toolkit to spread state updates to the view layer instantly without browser refreshes.

---

## 🛠️ Tech Stack

### Frontend
- **React 18**
- **Redux Toolkit** (Global State Management)
- **Vite** (Asset Bundler)
- **Tailwind CSS** (Styling)
- **Axios** (HTTP Client)

### Backend
- **Python 3.11+**
- **FastAPI** (ASGI Framework)
- **SQLAlchemy** (Database ORM — SQLite locally, Postgres in production)
- **LangGraph** (Agentic Workflow Framework)
- **Groq Cloud API** (`llama-3.1-8b-instant`)
- **PyPDF2 & Python-Docx** (Document Processing)

---

## 📁 Project Structure

```text
ai-first-crm-hcp/
├── backend/
│   ├── main.py                          # Uvicorn entrypoint wrapper
│   ├── app/
│   │   ├── main.py                      # FastAPI application & API routing
│   │   ├── core/
│   │   │   ├── config.py                # Environment settings (DATABASE_URL, CORS, Groq)
│   │   │   └── database.py              # SQLAlchemy engine & session
│   │   ├── models/                      # Interaction & Complaint database models
│   │   ├── schemas/                     # Pydantic request/response schemas
│   │   └── services/
│   │       ├── agent.py                 # HCP CRM LangGraph workflow
│   │       ├── complaint_agent.py       # QA Complaint Chat LangGraph workflow
│   │       └── complaint_intake_workflow.py # QA Document Extraction pipeline
│   ├── requirements.txt                 # Python dependency configurations
│   └── .env.example                     # Backend environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/                  # Forms, chat assistants & intake UI
│   │   ├── config/
│   │   │   └── api.js                   # API base URL (VITE_API_URL)
│   │   ├── pages/                       # Dashboard & ComplaintDashboard views
│   │   ├── redux/                       # Centralized Redux state management
│   │   ├── App.jsx                      # Core UI shell wrapper view layout
│   │   └── main.jsx                     # Vite DOM execution mount point
│   ├── .env.example                     # Frontend environment variable template
│   ├── vercel.json                      # Vercel production build configuration
│   ├── package.json                     # Frontend dependencies configuration
│   └── vite.config.js                   # Vite build & env configuration
├── render.yaml                          # Render Blueprint (backend + Postgres)
└── docker-compose.yml                   # Optional local Postgres service
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KeshavPatgar/ai-first-crm-hcp.git
cd ai-first-crm-hcp
```

### 2. Backend Setup (FastAPI)
Navigate to the backend working directory, install dependencies, configure your environment file, and run the server:

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the root of the `backend/` folder (or copy from `.env.example`):

```env
GROQ_API_KEY=your_actual_groq_api_key
DATABASE_URL=sqlite:///./crm.db
CORS_ORIGINS=*
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for AI features |
| `DATABASE_URL` | No | Defaults to SQLite (`sqlite:///./crm.db`) for local dev |
| `CORS_ORIGINS` | No | Comma-separated frontend URLs; use `*` for local dev |

Start the Uvicorn development server:
```bash
uvicorn app.main:app --reload --port 8000
```
> **Note:** The FastAPI backend will spin up at `http://localhost:8000`

### 3. Frontend Setup (React)
Open a new terminal window or tab, install the packages, configure the environment, and run the Vite server:

```bash
cd frontend
npm install
```

Copy the environment template and point the frontend at your local backend:

```bash
cp .env.example .env.local
```

The default `.env.local` value connects to the local FastAPI server:

```env
VITE_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```
> **Note:** The React frontend dashboard container will launch at `http://localhost:5173`

---

## 🚀 Production Deployment

The project is configured for a split deployment: **Vercel** (frontend) + **Render** (backend).

### Deploy Backend (Render)

1. Push this repository to GitHub.
2. In [Render](https://render.com), create a new **Blueprint** and connect the repo — it will read `render.yaml`.
3. Set the following environment variables in the Render dashboard:
   - `GROQ_API_KEY` — your Groq API key
   - `CORS_ORIGINS` — your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
4. Render will provision a Postgres database and wire `DATABASE_URL` automatically via the blueprint.

Production start command (already defined in `render.yaml`):

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Deploy Frontend (Vercel)

1. In [Vercel](https://vercel.com), import the GitHub repository.
2. Set the **Root Directory** to `frontend`.
3. Add the environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://your-backend.onrender.com`)
4. Deploy — Vercel uses `frontend/vercel.json` for the Vite build configuration.

### Build Frontend Locally (Optional)

```bash
cd frontend
npm run build
npm run preview
```

---

## 🔄 Supported AI Operations

### HCP Interactions Module
- 📝 **`log_interaction`**: Extracts clinical entities out of raw text to populate form fields.
- 🎯 **`edit_interaction`**: Modifies explicit data parameters via conversational context.
- 🚀 **`generate_actions` & `generate_summary`**: Analyzes session details to compile next-step strategies.
- 📧 **`generate_email`**: Automatically populates a follow-up email layout.

### QA & Complaints Module
- 📥 **`process_intake`**: Reads uploaded documents, extracts 12+ specific fields, and auto-generates the risk severity index.
- 🔍 **`tool_recommend_root_cause` & `tool_recommend_capa`**: Evaluates the defect to suggest causes and fixes.
- ⚠️ **`tool_duplicate_check`**: Warns if similar defective batches have been logged previously.

---

## 📋 Comprehensive Example Prompt Test Case

**HCP Module:** Paste this text case directly into the chat container:
> *"I just finished a clinic meeting today on July 11th with Dr. Sarah Jenkins at City General Hospital. She is a licensed Pediatrician. We sat down for a structured briefing session to discuss the clinical efficacy metrics of Prodo-X. She showed a highly positive sentiment toward the data. I provided her with 5 drug sample vials and shared our latest clinical brochures. The key outcome of our meeting was her agreement to run a local patient trial evaluation. For our next steps, I need to deliver the updated protocol manuals by next Monday, and she asked me to schedule a comprehensive follow-up presentation for her clinical team on July 20th."*

**QA & Complaints Module:** Save this as a `.txt` file and drag it into the document upload zone:
> *"I am writing to formally log a critical product complaint regarding a recent shipment we received at City General Hospital. Upon opening several bottles, we discovered that the medication was severely defective. Specifically, we found discolored, crumbling, and powdery tablets. Product Name: Amoxicillin. Strength: 500mg. Batch Number: AMX-99812. Affected Quantity: 5 bottles."*

---

## 🧔 Author

**Keshav Patgar**  
*Aspiring Full Stack Software Development Engineer*

**Core Stack:** Java • JavaScript • React • Node.js • FastAPI • LangGraph • AI System Applications

<p align="center">
  <a href="https://github.com/KeshavPatgar/ai-first-crm-hcp">GitHub</a>
</p>
