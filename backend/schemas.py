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