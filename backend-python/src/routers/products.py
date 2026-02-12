from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models.product import Product
from ..dependencies import get_current_user

router = APIRouter()

@router.get("/products")
def get_products(session: Session = Depends(get_session)):
    return session.exec(select(Product)).all()

@router.post("/products")
def create_product(
    product: Product,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(403, "Not allowed")
    
    session.add(product)
    session.commit()
    session.refresh(product)
    return product