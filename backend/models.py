from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import text
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))

    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)

class Doctor(Base):
    __tablename__ = "doctors"
    doctor_id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)

class Consultation(Base):
    __tablename__ = "consultations"
    
    consultation_id = Column(Integer, primary_key=True, nullable=False)
    
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    
    status = Column(String, server_default="Active")
    started_at = Column(TIMESTAMP(timezone=True), server_default=text('now()'))

    patient = relationship("Patient") 

class LabOrder(Base):
    __tablename__ = "lab_orders"
    order_id = Column(Integer, primary_key=True, nullable=False)
    consultation_id = Column(Integer, ForeignKey("consultations.consultation_id", ondelete="CASCADE"), nullable=False)
    test_name = Column(String, nullable=False)
    status = Column(String, server_default="Pending")

class LabResult(Base):
    __tablename__ = "lab_results"
    result_id = Column(Integer, primary_key=True, nullable=False)
    order_id = Column(Integer, ForeignKey("lab_orders.order_id", ondelete="CASCADE"), nullable=False)
    findings = Column(Text, nullable=False)

class MedicalReport(Base):
    __tablename__ = "medical_reports"
    report_id = Column(Integer, primary_key=True, nullable=False)
    consultation_id = Column(Integer, ForeignKey("consultations.consultation_id", ondelete="CASCADE"), nullable=False)
    diagnosis = Column(Text, nullable=False)
    treatment = Column(Text, nullable=False)