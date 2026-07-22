from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComplaintBase(BaseModel):
    customer_name: Optional[str] = None
    organization: Optional[str] = None
    product_name: Optional[str] = None
    strength: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity: Optional[str] = None
    packaging: Optional[str] = None
    manufacturing_site: Optional[str] = None
    complaint_category: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    risk_summary: Optional[str] = None
    suggested_action: Optional[str] = None
    confidence_score: Optional[float] = None
    root_cause: Optional[str] = None
    capa: Optional[str] = None

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(ComplaintBase):
    pass

class Complaint(ComplaintBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChatRequestComplaint(BaseModel):
    message: str
    current_form: dict
