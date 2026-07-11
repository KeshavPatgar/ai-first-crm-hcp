from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import SessionLocal, engine, Base
from app.models import interaction as models
from app.schemas import interaction as schemas
from app.services.agent import process_chat

# Create DB tables (if not using alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI First CRM HCP Module", version="1.0.0")

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
def chat_endpoint(request: schemas.ChatRequest):
    result = process_chat(request.message, request.current_form)
    return result

@app.post("/api/interaction/", response_model=schemas.Interaction)
def create_interaction(interaction: schemas.InteractionCreate, db: Session = Depends(get_db)):
    db_interaction = models.Interaction(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@app.put("/api/interaction/{id}", response_model=schemas.Interaction)
def update_interaction(id: int, interaction: schemas.InteractionUpdate, db: Session = Depends(get_db)):
    db_interaction = db.query(models.Interaction).filter(models.Interaction.id == id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    update_data = interaction.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
    
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@app.get("/api/interaction/{id}", response_model=schemas.Interaction)
def get_interaction(id: int, db: Session = Depends(get_db)):
    db_interaction = db.query(models.Interaction).filter(models.Interaction.id == id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return db_interaction

@app.get("/api/history/", response_model=List[schemas.Interaction])
def read_interactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    interactions = db.query(models.Interaction).offset(skip).limit(limit).all()
    return interactions
