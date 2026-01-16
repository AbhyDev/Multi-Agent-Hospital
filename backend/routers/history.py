"""
Patient Medical History Router — SQL JOIN Query Demonstrations

This router provides endpoints that showcase various SQL JOIN operations:
- LEFT JOIN for optional related records
- INNER JOIN for required relationships
- Multi-table JOINs for complete data retrieval
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from .. import database, models, oauth2, schemas

router = APIRouter(
    prefix="/history",
    tags=["Patient History"]
)


# ============================================================================
# ENDPOINT 1: Consultations with Medical Reports (LEFT JOIN)
# ============================================================================
# SQL equivalent:
# SELECT c.consultation_id, c.status, c.started_at,
#        mr.diagnosis, mr.treatment
# FROM consultations c
# LEFT JOIN medical_reports mr ON c.consultation_id = mr.consultation_id
# WHERE c.patient_id = :patient_id
# ORDER BY c.started_at DESC
# ============================================================================

@router.get("/consultations", response_model=List[schemas.ConsultationHistory])
def get_consultation_history(
    db: Session = Depends(database.get_db),
    current_user: models.Patient = Depends(oauth2.get_current_user)
):
    """
    Get all consultations for the logged-in patient with their medical reports.
    Uses LEFT JOIN to include consultations even if no report exists yet.
    """
    query = text("""
        SELECT 
            c.consultation_id,
            c.status,
            c.started_at,
            mr.diagnosis,
            mr.treatment
        FROM consultations c
        LEFT JOIN medical_reports mr ON c.consultation_id = mr.consultation_id
        WHERE c.patient_id = :patient_id
        ORDER BY c.started_at DESC
    """)
    
    result = db.execute(query, {"patient_id": current_user.patient_id})
    rows = result.fetchall()
    
    return [
        schemas.ConsultationHistory(
            consultation_id=row.consultation_id,
            status=row.status,
            started_at=row.started_at,
            diagnosis=row.diagnosis,
            treatment=row.treatment
        )
        for row in rows
    ]


# ============================================================================
# ENDPOINT 2: Lab Orders with Results (INNER JOIN + LEFT JOIN)
# ============================================================================
# SQL equivalent:
# SELECT lo.order_id, lo.test_name, lo.status AS order_status,
#        lr.findings, c.started_at AS consultation_date
# FROM lab_orders lo
# JOIN consultations c ON lo.consultation_id = c.consultation_id
# LEFT JOIN lab_results lr ON lo.order_id = lr.order_id
# WHERE c.patient_id = :patient_id
# ORDER BY c.started_at DESC
# ============================================================================

@router.get("/lab-results", response_model=List[schemas.LabResultHistory])
def get_lab_results_history(
    db: Session = Depends(database.get_db),
    current_user: models.Patient = Depends(oauth2.get_current_user)
):
    """
    Get all lab orders and their results for the logged-in patient.
    Uses INNER JOIN (consultations must exist) + LEFT JOIN (results may be pending).
    """
    query = text("""
        SELECT 
            lo.order_id,
            lo.test_name,
            lo.status AS order_status,
            lr.findings,
            c.started_at AS consultation_date
        FROM lab_orders lo
        JOIN consultations c ON lo.consultation_id = c.consultation_id
        LEFT JOIN lab_results lr ON lo.order_id = lr.order_id
        WHERE c.patient_id = :patient_id
        ORDER BY c.started_at DESC
    """)
    
    result = db.execute(query, {"patient_id": current_user.patient_id})
    rows = result.fetchall()
    
    return [
        schemas.LabResultHistory(
            order_id=row.order_id,
            test_name=row.test_name,
            order_status=row.order_status,
            findings=row.findings,
            consultation_date=row.consultation_date
        )
        for row in rows
    ]


# ============================================================================
# ENDPOINT 3: Complete Medical Record (Multi-table JOIN - 4 tables)
# ============================================================================
# SQL equivalent:
# SELECT c.consultation_id, c.status, c.started_at,
#        mr.diagnosis, mr.treatment,
#        lo.test_name, lo.status AS lab_status,
#        lr.findings
# FROM consultations c
# LEFT JOIN medical_reports mr ON c.consultation_id = mr.consultation_id
# LEFT JOIN lab_orders lo ON c.consultation_id = lo.consultation_id
# LEFT JOIN lab_results lr ON lo.order_id = lr.order_id
# WHERE c.patient_id = :patient_id
# ORDER BY c.started_at DESC
# ============================================================================

@router.get("/complete", response_model=List[schemas.CompleteHistoryItem])
def get_complete_history(
    db: Session = Depends(database.get_db),
    current_user: models.Patient = Depends(oauth2.get_current_user)
):
    """
    Get complete medical record for the logged-in patient.
    Uses multiple LEFT JOINs to combine data from 4 tables:
    consultations → medical_reports → lab_orders → lab_results
    """
    query = text("""
        SELECT 
            c.consultation_id,
            c.status,
            c.started_at,
            mr.diagnosis,
            mr.treatment,
            lo.test_name,
            lo.status AS lab_status,
            lr.findings
        FROM consultations c
        LEFT JOIN medical_reports mr ON c.consultation_id = mr.consultation_id
        LEFT JOIN lab_orders lo ON c.consultation_id = lo.consultation_id
        LEFT JOIN lab_results lr ON lo.order_id = lr.order_id
        WHERE c.patient_id = :patient_id
        ORDER BY c.started_at DESC
    """)
    
    result = db.execute(query, {"patient_id": current_user.patient_id})
    rows = result.fetchall()
    
    return [
        schemas.CompleteHistoryItem(
            consultation_id=row.consultation_id,
            status=row.status,
            started_at=row.started_at,
            diagnosis=row.diagnosis,
            treatment=row.treatment,
            test_name=row.test_name,
            lab_status=row.lab_status,
            findings=row.findings
        )
        for row in rows
    ]


# ============================================================================
# ENDPOINT 4: Summary Statistics (Aggregation with JOIN)
# ============================================================================
# SQL equivalent:
# SELECT 
#     COUNT(DISTINCT c.consultation_id) as total_consultations,
#     COUNT(DISTINCT lo.order_id) as total_lab_orders,
#     COUNT(DISTINCT mr.report_id) as total_reports
# FROM consultations c
# LEFT JOIN lab_orders lo ON c.consultation_id = lo.consultation_id
# LEFT JOIN medical_reports mr ON c.consultation_id = mr.consultation_id
# WHERE c.patient_id = :patient_id
# ============================================================================

@router.get("/summary", response_model=schemas.HistorySummary)
def get_history_summary(
    db: Session = Depends(database.get_db),
    current_user: models.Patient = Depends(oauth2.get_current_user)
):
    """
    Get summary statistics for the logged-in patient's medical history.
    Uses aggregation functions with JOINs.
    """
    query = text("""
        SELECT 
            COUNT(DISTINCT c.consultation_id) as total_consultations,
            COUNT(DISTINCT lo.order_id) as total_lab_orders,
            COUNT(DISTINCT mr.report_id) as total_reports
        FROM consultations c
        LEFT JOIN lab_orders lo ON c.consultation_id = lo.consultation_id
        LEFT JOIN medical_reports mr ON c.consultation_id = mr.consultation_id
        WHERE c.patient_id = :patient_id
    """)
    
    result = db.execute(query, {"patient_id": current_user.patient_id})
    row = result.fetchone()
    
    return schemas.HistorySummary(
        total_consultations=row.total_consultations or 0,
        total_lab_orders=row.total_lab_orders or 0,
        total_reports=row.total_reports or 0,
        patient_name=current_user.name,
        patient_email=current_user.email
    )
