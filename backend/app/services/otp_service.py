import secrets
import resend
from app.core.config import settings
from app.core.security import get_password_hash

resend.api_key = settings.RESEND_API_KEY

def generate_otp() -> str:
    """Generates a secure 6-digit OTP."""
    if settings.VERCEL:
        # Deployed: a real random code, sent by email (needs RESEND_API_KEY).
        return f"{secrets.randbelow(1_000_000):06d}"
    # Local development: a fixed code to avoid email blocking issues.
    return "123456"

def send_otp_email(to_email: str, otp: str) -> bool:
    """Sends OTP email via Resend API."""
    try:
        if not resend.api_key or resend.api_key == "re_your_api_key_here":
            if settings.VERCEL:
                print("RESEND_API_KEY is not set; cannot send login codes")
                return False
            print(f"DEV MODE: Pretending to send OTP '{otp}' to {to_email}")
            return True

        if not settings.VERCEL:
            # Never log codes when deployed: anyone who can read the logs could sign in.
            print(f"\n🔐 DEV MODE: Generated OTP '{otp}' for {to_email} 🔐\n")
        
        params: resend.Emails.SendParams = {
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Your PeanutIQ Login Code",
            "html": f"<p>Your PeanutIQ authentication code is: <strong>{otp}</strong></p><p>This code will expire in 10 minutes.</p>",
        }
        
        email = resend.Emails.send(params)
        print(f"Resend email dispatched. ID: {email['id']}")
        return True
    except Exception as e:
        print(f"Failed to send email via Resend: {e}")
        if settings.VERCEL:
            return False  # The website shows an error instead of waiting for an email that never comes.
        print("Continuing anyway since this is a development environment...")
        return True
