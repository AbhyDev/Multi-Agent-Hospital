"""
MongoDB client for storing conversation logs.
Connects lazily on first use - won't crash if MongoDB isn't running during import.
"""

from pymongo import MongoClient
from pymongo.collection import Collection
from typing import Optional
from .config import settings

# Lazy connection - only connects when first used
_client: Optional[MongoClient] = None


def get_mongo_client() -> MongoClient:
    """Get or create MongoDB client connection."""
    global _client
    if _client is None:
        _client = MongoClient(settings.mongodb_uri)
        print("✅ MongoDB connected")
    return _client


def get_conversation_logs() -> Collection:
    """Returns the conversation_logs collection from ai_hospital database."""
    client = get_mongo_client()
    db = client["ai_hospital"]
    return db["conversation_logs"]
