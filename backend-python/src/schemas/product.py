# # from typing import Optional
# # from datetime import datetime
# # from sqlmodel import SQLModel, Field

# # class Product(SQLModel, table=True):
# #     id: Optional[int] = Field(default=None, primary_key=True)
# #     name: str
# #     description: Optional[str] = None
# #     price: float
# #     stock: int = 0
# #     image_url: Optional[str] = None
# #     created_at: datetime = Field(default_factory=datetime.utcnow)
# from fastapi import APIRouter, Depends
# from sqlmodel import Session, select

# from ..database import get_session
# from ..models.product import Product
# from ..dependencies import get_current_user
# from ..models.user import User

# router = APIRouter()


# @router.get("/products")
# def get_products(
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_user)
# ):
#     products = session.exec(select(Product)).all()
#     return products
from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    stock: int


