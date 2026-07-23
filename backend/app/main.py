from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import SessionLocal, engine, Base
from app.models import interaction as interaction_models
from app.models import complaint as complaint_models
from app.schemas import interaction as interaction_schemas
from app.schemas import complaint as complaint_schemas
from app.services.agent import process_chat
from app.services.complaint_agent import process_complaint_chat

# Create DB tables
interaction_models.Base.metadata.create_all(bind=engine)
complaint_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI First CRM & QA Module", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/chat/")
def chat_endpoint(request: interaction_schemas.ChatRequest):
    result = process_chat(request.message, request.current_form)
    return result

@app.post("/api/interaction/", response_model=interaction_schemas.Interaction)
def create_interaction(interaction: interaction_schemas.InteractionCreate, db: Session = Depends(get_db)):
    db_interaction = interaction_models.Interaction(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@app.put("/api/interaction/{id}", response_model=interaction_schemas.Interaction)
def update_interaction(id: int, interaction: interaction_schemas.InteractionUpdate, db: Session = Depends(get_db)):
    db_interaction = db.query(interaction_models.Interaction).filter(interaction_models.Interaction.id == id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    update_data = interaction.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
    
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@app.get("/api/interaction/{id}", response_model=interaction_schemas.Interaction)
def get_interaction(id: int, db: Session = Depends(get_db)):
    db_interaction = db.query(interaction_models.Interaction).filter(interaction_models.Interaction.id == id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return db_interaction

@app.get("/api/history/", response_model=List[interaction_schemas.Interaction])
def read_interactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    interactions = db.query(interaction_models.Interaction).offset(skip).limit(limit).all()
    return interactions

@app.post("/api/complaints/chat")
def complaint_chat_endpoint(request: complaint_schemas.ChatRequestComplaint):
    result = process_complaint_chat(request.message, request.current_form)
    return result

@app.post("/api/complaints/commit", response_model=complaint_schemas.Complaint)
def create_complaint(complaint: complaint_schemas.ComplaintCreate, db: Session = Depends(get_db)):
    # Check for duplicates based on batch_number and product_name, or exact description match
    if complaint.description:
        duplicate = db.query(complaint_models.Complaint).filter(
            complaint_models.Complaint.description == complaint.description
        ).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Duplicate Complaint Detected: A complaint with this exact description already exists.")
            
    if complaint.batch_number and complaint.product_name:
        duplicate = db.query(complaint_models.Complaint).filter(
            complaint_models.Complaint.batch_number == complaint.batch_number,
            complaint_models.Complaint.product_name == complaint.product_name,
            complaint_models.Complaint.customer_name == complaint.customer_name
        ).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Duplicate Complaint Detected: A complaint for this product and batch from this customer already exists.")

    db_complaint = complaint_models.Complaint(**complaint.model_dump())
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

from fastapi import UploadFile, File
import PyPDF2
import docx
import io

from app.services.complaint_intake_workflow import process_intake

@app.post("/api/complaints/upload")
async def upload_document(file: UploadFile = File(...)):
    content_text = ""
    try:
        contents = await file.read()
        if file.filename.endswith('.pdf'):
            reader = PyPDF2.PdfReader(io.BytesIO(contents))
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    content_text += text + "\n"
        elif file.filename.endswith('.docx'):
            doc = docx.Document(io.BytesIO(contents))
            for para in doc.paragraphs:
                content_text += para.text + "\n"
        elif file.filename.endswith('.txt') or file.filename.endswith('.eml'):
            content_text = contents.decode('utf-8')
        else:
            # For images, we mock extraction since Groq's llama3 doesn't do vision natively here.
            content_text = "MOCKED VISION OCR: " + file.filename + "\n" + "This image contains a customer complaint about missing tablets."
            
        # Process the extracted text through the intake workflow
        result = process_intake(content_text.strip(), {})
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ExtractRequest(BaseModel):
    text: str
    current_form: dict = {}

@app.post("/api/complaints/extract")
def extract_complaint(request: ExtractRequest):
    result = process_intake(request.text, request.current_form)
    return result

@app.post("/api/complaints/risk")
def generate_risk(request: complaint_schemas.ChatRequestComplaint):
    # This route specifically handles standalone risk assessment if requested directly.
    # Currently, our agent handles this within the chat automatically, but this route is provided as requested.
    result = process_complaint_chat("Generate risk assessment for this complaint", request.current_form)
    return result
