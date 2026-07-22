from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from app.core.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. Origin & Customer Details
    customer_name = Column(String, index=True)
    organization = Column(String, index=True)
    
    # 2. Product & Batch Identification
    product_name = Column(String, index=True)
    strength = Column(String)
    batch_number = Column(String, index=True)
    manufacturing_date = Column(String)
    expiry_date = Column(String)
    quantity = Column(String)
    packaging = Column(String)
    manufacturing_site = Column(String)
    
    # 3. Complaint Details
    complaint_category = Column(String)
    description = Column(Text)
    
    # 4. Risk Assessment & Analysis
    severity = Column(String)
    risk_summary = Column(Text)
    suggested_action = Column(Text)
    confidence_score = Column(Float)
    root_cause = Column(Text)
    capa = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
