# from fastapi import APIRouter, Depends
# from sqlmodel import Session, select
# import multiprocessing
# from multiprocessing import Process, Pool
# from ..database import get_session
# from ..models.product import Product
# from ..schemas.product import ProductCreate

# router = APIRouter()

# @router.post("/products")
# def create_product(data: ProductCreate, session: Session = Depends(get_session)):
#     product = Product(**data.dict())
#     session.add(product)
#     session.commit()
#     session.refresh(product)
#     return product

# @router.get("/products")
# def list_products(session: Session = Depends(get_session)):
#     return session.exec(select(Product)).all()

# from fastapi import APIRouter, Depends
# from sqlmodel import Session
# from ..database import get_session
# from ..dependencies import get_current_user
# from ..services.stripe_service import create_checkout_session

# router = APIRouter()

# @router.post("/{product_id}/buy")
# def buy_product(
#     product_id: int,
#     session: Session = Depends(get_session),
#     current_user = Depends(get_current_user)
# ):
#     return create_checkout_session(
#         product_id=product_id,
#         user_id=current_user.id,
#         session=session
#     )
# # src/routers/products.py  (or wherever it is)
# from fastapi import APIRouter, HTTPException, Path

# router = APIRouter()

# @router.post("/{product_id}/buy")
# async def buy_product(
#     product_id: int = Path(..., description="The ID of the product to buy", gt=0)
# ):
#     # your buy logic here
#     if product_id not in fake_products_db:
#         raise HTTPException(404, "Product not found")
#     return {"message": f"Bought product {product_id}"}
# src/routers/products.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlmodel import Session, select

from ..database import get_session
from ..dependencies import get_current_user
from ..models.product import Product
from ..models.user import User  # assuming your user model
from ..schemas.product import ProductCreate, ProductRead  # ← use response model if you have it
from ..services.stripe_service import create_checkout_session

router = APIRouter(
    prefix="/products",
    tags=["products"],
)


@router.post(
    "",
    response_model=ProductRead,  # optional — if you have a read schema
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product (admin only?)",
)
def create_product(
    data: ProductCreate,
    session: Session = Depends(get_session),
    # current_user = Depends(get_current_user),   # ← uncomment if only admins can create
):
    product = Product(**data.dict())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.get(
    "",
    response_model=List[ProductRead],
    summary="List all available products",
)
def list_products(session: Session = Depends(get_session)):
    statement = select(Product)
    # .where(Product.is_active == True)   # ← optional filter
    products = session.exec(statement).all()
    return products


@router.post(
    "/{product_id}/buy",
    summary="Initiate purchase (create Stripe checkout session)",
    # response_model=...,   # ← can be dict or custom CheckoutResponse
)
def buy_product(
    product_id: int = Path(
        ...,
        description="ID of the product to purchase",
        gt=0,               # must be positive
        example=42,
    ),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),  # requires login
):
    # 1. Check if product exists
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # 2. Optional: check if product is available / in stock / etc.
    # if not product.is_available:
    #     raise HTTPException(400, "Product is not available for purchase")

    # 3. Create Stripe checkout session
    try:
        checkout_result = create_checkout_session(
            product_id=product_id,
            user_id=current_user.id,
            session=session,           # pass db session if needed inside service
        )
        return checkout_result         # usually {"session_id": "...", "url": "https://checkout.stripe.com/..."}

    except Exception as e:
        # You can make this more specific (e.g. stripe.error.CardError, etc.)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )