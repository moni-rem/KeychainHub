# # src/services/stripe_service.py

import stripe
from fastapi import HTTPException, Request
from sqlmodel import Session

from ..config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FRONTEND_URL
from ..models.product import Product


stripe.api_key = STRIPE_SECRET_KEY


def create_checkout_session(
    product_id: int,
    user_id: int,
    session: Session
):
    """
    Create Stripe Checkout session for purchasing a product
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
                            "description": product.description or "No description",
                        },
                        "unit_amount": int(product.price * 100),  # cents
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=f"{FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/cancel",
            metadata={
                "user_id": str(user_id),      # stripe metadata must be strings
                "product_id": str(product_id),
            },
        )

        return {"checkout_url": checkout_session.url}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


async def handle_webhook(request: Request):
    """
    Handle Stripe webhook events (mainly checkout.session.completed)
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event["type"] == "checkout.session.completed":
        session_data = event["data"]["object"]

        user_id = session_data["metadata"].get("user_id")
        product_id = session_data["metadata"].get("product_id")

        if user_id and product_id:
            # Here you should:
            # 1. Reduce product stock
            # 2. Create an Order record in your database
            # 3. Grant access to digital product if applicable
            # 4. Send confirmation email

            print(f"Payment successful → User: {user_id} | Product: {product_id}")
            # Example: update stock (you must do this in a transaction)
            # product.stock -= 1
            # session.add(product)
            # session.commit()

    elif event["type"] == "checkout.session.expired":
        print("Checkout session expired")

    # Return 200 to acknowledge receipt
    return {"status": "success"}