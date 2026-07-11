from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InteractionBase(BaseModel):
    hcp_name: Optional[str] = None
    hospital: Optional[str] = None
    speciality: Optional[str] = None
    interaction_type: Optional[str] = "Meeting"
    topics_discussed: Optional[str] = None
    materials_shared: Optional[str] = None
    samples_distributed: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    followup_actions: Optional[str] = None
    followup_date: Optional[str] = None

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(InteractionBase):
    pass

class Interaction(InteractionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    current_form: Optional[dict] = {}
