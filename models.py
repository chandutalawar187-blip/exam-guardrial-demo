from datetime import datetime
from pydantic import BaseModel

class Event(BaseModel):
    session_id: str
    event_type: str
    severity: str
    timestamp:datetime = datetime.now()