from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..database import get_session
from ..models.product import Product
from ..schemas.product import ProductCreate

router = APIRouter()

@router.post("/products")
def create_product(data: ProductCreate, session: Session = Depends(get_session)):
    product = Product(**data.dict())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.get("/products")
def list_products(session: Session = Depends(get_session)):
    return session.exec(select(Product)).all()

from fastapi import APIRouter, Depends
from sqlmodel import Session
from ..database import get_session
from ..dependencies import get_current_user
from ..services.stripe_service import create_checkout_session

router = APIRouter()

@router.post("/{product_id}/buy")
def buy_product(
    product_id: int,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    return create_checkout_session(
        product_id=product_id,
        user_id=current_user.id,
        session=session
    )
