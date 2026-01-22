from fastapi import FastAPI
from dotenv import load_dotenv
from backend.api.signup import router as signup_router
from backend.api.activate import router as activate_router
from backend.api.complete_profile import router as complete_profile_router
from backend.api.update_profile import router as update_profile_router
from backend.api.refresh_token import router as refresh_token_router
from backend.api.login import router as login_router
from backend.api.logout import router as logout_router
from backend.api.soap_test import router as soap_test_router


load_dotenv()

app = FastAPI(title="Stealth Backend",version="1.0.0")

app.include_router(signup_router, prefix="/api")
app.include_router(activate_router, prefix="/api")
app.include_router(complete_profile_router, prefix="/api")
app.include_router(login_router, prefix="/api")
app.include_router(logout_router, prefix="/api")
app.include_router(update_profile_router, prefix="/api")
app.include_router(refresh_token_router, prefix="/api")
app.include_router(soap_test_router, prefix="/api")


@app.get("/")
def health():
    return {"status": "ok"}