# cors_config.py
from fastapi.middleware.cors import CORSMiddleware

def add_cors_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # CRA default
            "http://localhost:5173",  # Vite default
        ],
        allow_credentials=True,
        allow_methods=["*"] ,
        allow_headers=["*"]
    )
