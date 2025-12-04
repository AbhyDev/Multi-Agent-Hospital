from fastapi import FastAPI
from .api import router
from .cors_config import add_cors_middleware

app = FastAPI()
add_cors_middleware(app)
app.include_router(router)