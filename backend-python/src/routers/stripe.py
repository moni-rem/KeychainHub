# src/routers/stripe.py  (or wherever you want)

from fastapi import APIRouter, Request
from ..services.stripe_service import handle_webhook

router = APIRouter(prefix="/stripe", tags=["stripe"])

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Public endpoint for Stripe to send webhook events.
    Do NOT protect this endpoint with authentication!
    """
    return await handle_webhook(request)