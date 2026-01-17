from pydantic import BaseModel, Field

class Doctor(BaseModel):
    fullName: str = Field(..., min_length=2)
    email: str
    speciality: str
    practiceType: str
    yearsOfExperience: int = Field(..., ge=0, le=60)
    organizationName: str
    phoneNumber: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)


class CompleteProfileRequest(BaseModel):
    doctor: Doctor
    token : str