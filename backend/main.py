from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pdfplumber
import docx
import io
import re

# Create FastAPI instance
app = FastAPI()

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Models ----------
class CandidateProfile(BaseModel):
    fullName: str
    email: str
    phone: str
    skills: List[str]
    experienceYears: int
    education: str
    latestCompany: str

class JobRequirements(BaseModel):
    mustHaveSkills: List[str]
    minExperienceYears: int
    educationLevel: str
    requiredLanguages: List[str]
    locationPreference: str
    shiftAvailability: str

class ScreeningResult(BaseModel):
    eligible: bool
    score: int
    matchedRequirements: List[str]
    missingRequirements: List[str]
    summary: str

# ---------- CV Parsing ----------
def extract_text_from_pdf(file_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    text = "\n".join(para.text for para in doc.paragraphs)
    return text

def parse_cv_text(text: str) -> dict:
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone_match = re.search(r'\+?[\d\s\-\(\)]{8,}', text)
    common_skills = ["python", "javascript", "react", "node.js", "sql", "aws", "docker"]
    found_skills = [skill for skill in common_skills if skill.lower() in text.lower()]
    return {
        "fullName": "Extracted Name",
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(0) if phone_match else "",
        "skills": found_skills,
        "experienceYears": 3,
        "education": "Bachelor's",
        "latestCompany": "Unknown"
    }

@app.post("/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    contents = await file.read()
    if file.filename.endswith('.pdf'):
        text = extract_text_from_pdf(contents)
    elif file.filename.endswith('.docx'):
        text = extract_text_from_docx(contents)
    else:
        raise HTTPException(400, "Unsupported file type. Use PDF or DOCX.")
    parsed = parse_cv_text(text)
    return parsed

@app.post("/screen-candidate")
async def screen_candidate(candidate: CandidateProfile, job: JobRequirements):
    matched = []
    missing = []
    for skill in job.mustHaveSkills:
        if skill.lower() in [s.lower() for s in candidate.skills]:
            matched.append(skill)
        else:
            missing.append(skill)
    if candidate.experienceYears >= job.minExperienceYears:
        matched.append(f"Experience: {candidate.experienceYears} years")
    else:
        missing.append(f"Experience: need {job.minExperienceYears}+ years")
    if job.educationLevel.lower() in candidate.education.lower():
        matched.append(f"Education: {candidate.education}")
    else:
        missing.append(f"Education: {job.educationLevel} required")
    total = len(matched) + len(missing)
    score = int((len(matched) / total) * 100) if total > 0 else 50
    eligible = score >= 60
    summary = f"Candidate matches {len(matched)} out of {total} key requirements."
    return ScreeningResult(
        eligible=eligible,
        score=score,
        matchedRequirements=matched,
        missingRequirements=missing,
        summary=summary
    )

@app.post("/check-duplicate")
async def check_duplicate(candidate: dict):
    return {
        "isDuplicate": False,
        "matchedCandidates": [],
        "matchReasons": [],
        "confidenceScore": 0
    }