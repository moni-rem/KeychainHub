from typing import Optional
from decimal import Decimal
from datetime import datetime
from sqlmodel import SQLModel, Field

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    price: Decimal = Field(max_digits=10, decimal_places=2)
    category: Optional[str] = None
    stock_quantity: int = Field(default=0)
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
