<div align="center">
  <h1>🚀 AI-First CRM HCP Module</h1>
  <p><strong>An AI-powered, production-ready CRM module designed specifically for pharmaceutical field representatives and Healthcare Professionals (HCP).</strong></p>
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
  ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

---

The application utilizes an **AI-First UX split-screen architecture** where the form panel on the left is entirely disabled for direct text entry. Instead, an intelligent AI Assistant handles all operational state mutations dynamically via natural language processing on the right panel, completely shifting the data-entry burden from the representative to the machine.

## ✨ Features

- 🤖 **AI-Powered Interaction Logging:** Converts messy text into clean entity extraction instantly.
- 🧠 **LangGraph Orchestration:** A compiled state graph utilizing the high-speed `llama3-8b-8192` model via Groq for fast, accurate tool calling.
- 📝 **Zero-Hardcoding Payload Extraction:** Uses dynamic Python dictionary unpacking (`FormState(**args)`) to extract any doctor name, hospital, or product without rigid text matching.
- 🔄 **State Memory Delta Corrections:** Targets and mutates explicit fields via conversational history context while perfectly preserving adjacent data points.
- 💬 **ChatGPT-Style Fallback Flexibility:** Gracefully answers general conversational text while executing backend logic simultaneously.
- ⚙️ **Real-Time UI Synchronization:** Leverages Redux Toolkit to spread state updates to the view layer instantly without browser refreshes.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**
- **Redux Toolkit** (Global State Management)
- **Vite** (Asset Bundler)
- **Tailwind CSS** (Styling)

### Backend
- **Python**
- **FastAPI** (ASGI Framework)
- **LangGraph** (Agentic Workflow Framework)
- **Groq Cloud API** (`llama3-8b-8192`)

---

## 📁 Project Structure

```text
aivoa-crm-app/
├── backend/
│   ├── main.py            # FastAPI application entrypoint & API routing configuration
│   ├── agent.py           # LangGraph state engine graph, tools definition, & node logic
│   ├── requirements.txt   # Python dependency configurations
│   └── .env               # Application credentials (GROQ_API_KEY)
└── frontend/
    ├── src/
    │   ├── components/    # Left-side InteractionForm & Right-side ChatAssistant UI
    │   ├── redux/         # Centralized Redux state management (formSlice, store)
    │   ├── App.jsx        # Core UI shell wrapper view layout
    │   └── main.jsx       # Vite DOM execution mount point
    ├── package.json       # Frontend dependencies configuration
    ├── tailwind.config.js # Responsive CSS framework variables
    └── vite.config.js     # Local development server settings
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/AI-CRM-HCP.git
cd AI-CRM-HCP
```

### 2. Backend Setup (FastAPI)
Navigate to the backend working directory, install dependencies, configure your environment file, and run the server:

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the root of the `backend/` folder:
```env
GROQ_API_KEY=your_actual_groq_api_key
```

Start the Uvicorn development server:
```bash
uvicorn main:app --reload --port 8000
```
> **Note:** The FastAPI backend will spin up at `http://localhost:8000`

### 3. Frontend Setup (React)
Open a new terminal window or tab, install the packages, and run the Vite server:

```bash
cd frontend
npm install
npm run dev
```
> **Note:** The React frontend dashboard container will launch at `http://localhost:5173`

---

## 🔄 Supported AI Tool Operations

The assistant relies on a strict compiled state graph execution flow utilizing an `AgentState` mapping strategy (messages array + form_data layout configuration). The loop incorporates the following core tools:

- 📝 **`log_interaction`**: Performs comprehensive clinical entity extraction out of raw text paragraphs to populate all form fields from scratch.
- 🎯 **`edit_interaction`**: Targets and mutates explicit data parameters (e.g., changing names, locations, or sentiments) via conversational context memory while preserving surrounding data.
- 🚀 **`generate_actions`**: Analyzes session details to compile next-step strategy milestones directly into the Follow-up Actions section.
- 📊 **`generate_summary`**: Synthesizes an overview paragraph directly into the dashboard Outcomes text canvas.
- 📧 **`generate_email`**: Automatically populates an institutional follow-up email layout parsing live tokens gathered from active form context variables.
- 🧹 **`clear_interaction`**: Resets the state of the form to prepare for a new entry.

---

## 📋 Comprehensive Example Prompt Test Case

Paste this text case directly into the chat container to show off the system populating the entire dashboard panel in a single turn:

> *"I just finished a clinic meeting today on July 11th with Dr. Sarah Jenkins at City General Hospital. She is a licensed Pediatrician. We sat down for a structured briefing session to discuss the clinical efficacy metrics of Prodo-X. She showed a highly positive sentiment toward the data. I provided her with 5 drug sample vials and shared our latest clinical brochures. The key outcome of our meeting was her agreement to run a local patient trial evaluation. For our next steps, I need to deliver the updated protocol manuals by next Monday, and she asked me to schedule a comprehensive follow-up presentation for her clinical team on July 20th."*

---

## 🧔 Author

**Keshav Patgar**  
*Aspiring Full Stack Software Development Engineer*

**Core Stack:** Java • JavaScript • React • Node.js • FastAPI • LangGraph • AI System Applications

<p align="center">
  <a href="https://github.com/your-username">GitHub</a> • 
  <a href="https://linkedin.com/in/your-linkedin">LinkedIn</a>
</p>
