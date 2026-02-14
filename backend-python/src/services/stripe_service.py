import stripe
from ..config import STRIPE_SECRET_KEY

stripe.api_key = STRIPE_SECRET_KEY

def create_checkout(price_id: str):
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="payment",
        success_url="http://localhost:3000/success",
        cancel_url="http://localhost:3000/cancel",
    )
    return session.url
