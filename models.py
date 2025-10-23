from pydantic import BaseModel


class Timestamp(BaseModel):
    timestamp: str
    label: str
