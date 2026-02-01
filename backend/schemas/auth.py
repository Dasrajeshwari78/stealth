from pydantic import BaseModel, EmailStr
from typing import Optional

class SignupRequest(BaseModel):
    name: str
    email: EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UpdateProfileRequest(BaseModel):
    fullName: Optional[str] = None
    speciality: Optional[str] = None
    practiceType: Optional[str] = None
    yearsOfExperience: Optional[int] = None
    organizationName: Optional[str] = None
    phoneNumber: Optional[str] = None
    password: Optional[str] = None

