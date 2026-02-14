# import stripe
# from ..config import STRIPE_SECRET_KEY

# stripe.api_key = STRIPE_SECRET_KEY

# def create_checkout(price_id: str):
#     session = stripe.checkout.Session.create(
#         payment_method_types=["card"],
#         line_items=[{"price": price_id, "quantity": 1}],
#         mode="payment",
#         success_url="http://localhost:3000/success",
#         cancel_url="http://localhost:3000/cancel",
#     )
#     return session.url
import stripe
from fastapi import HTTPException
from sqlmodel import Session

from ..config import STRIPE_SECRET_KEY, FRONTEND_URL
from ..models.product import Product

stripe.api_key = STRIPE_SECRET_KEY


def create_checkout_session(product_id: int, user_id: int, session: Session):
    """
    Create Stripe Checkout session for a product
    """

    product = session.get(Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock <= 0:
        raise HTTPException(status_code=400, detail="Product out of stock")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": product.name,
                            "description": product.description,
                        },
                        "unit_amount": int(product.price * 100),
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=f"{FRONTEND_URL}/success",
            cancel_url=f"{FRONTEND_URL}/cancel",
            metadata={
                "user_id": user_id,
                "product_id": product_id,
            },
        )

        return {"checkout_url": checkout_session.url}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    #Add Webhook Support
    from fastapi import Request
from ..config import STRIPE_WEBHOOK_SECRET
import stripe


async def handle_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session_data = event["data"]["object"]

        user_id = session_data["metadata"]["user_id"]
        product_id = session_data["metadata"]["product_id"]

        # 🔥 Here you:
        # - Reduce stock
        # - Create order record
        # - Grant digital product access

        print("Payment successful for user:", user_id)

    return {"status": "success"}
#add this to routers/stripe.py
from fastapi import Request
from ..services.stripe_service import handle_webhook

@router.post("/webhook")
async def stripe_webhook(request: Request):
    return await handle_webhook(request)

