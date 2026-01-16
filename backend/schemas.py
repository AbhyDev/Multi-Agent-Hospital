from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class PatientCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    age: int
    gender: str

class PatientLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None

class PatientOut(BaseModel):
    patient_id: int
    email: EmailStr
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConsultationOut(BaseModel):
    consultation_id: int
    status: str
    started_at: datetime


# ============================================================================
# History Endpoint Response Schemas (for SQL JOIN demonstrations)
# ============================================================================

class ConsultationHistory(BaseModel):
    """Response for /history/consultations — LEFT JOIN with medical_reports"""
    consultation_id: int
    status: str
    started_at: datetime
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    
    class Config:
        from_attributes = True


class LabResultHistory(BaseModel):
    """Response for /history/lab-results — JOIN consultations + LEFT JOIN lab_results"""
    order_id: int
    test_name: str
    order_status: str
    findings: Optional[str] = None
    consultation_date: datetime
    
    class Config:
        from_attributes = True


class CompleteHistoryItem(BaseModel):
    """Response for /history/complete — Multi-table JOIN (4 tables)"""
    consultation_id: int
    status: str
    started_at: datetime
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    test_name: Optional[str] = None
    lab_status: Optional[str] = None
    findings: Optional[str] = None
    
    class Config:
        from_attributes = True


class HistorySummary(BaseModel):
    """Response for /history/summary — Aggregation with JOINs"""
    total_consultations: int
    total_lab_orders: int
    total_reports: int
    patient_name: str
    patient_email: str
    
    class Config:
        from_attributes = True