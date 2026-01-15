from fastapi import APIRouter, HTTPException, status, Response
from backend.schemas.auth import LoginRequest
from backend.db.mongo_client import doctors_collection
from backend.utils.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    summary="Login user and issue JWT cookie",
)
def login(payload: LoginRequest, response: Response):
    user = doctors_collection.find_one({"email": payload.email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not activated",
        )

    if not verify_password(payload.password, user.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(subject=user["email"])

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,   
        samesite="lax",
        max_age=60 * 60,
    )

    return {"message": "Login successful"}
