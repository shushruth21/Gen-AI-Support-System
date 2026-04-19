import os
from supabase import create_client, Client
from dotenv import load_dotenv
import supabase._sync.client
import supabase._async.client

# Supabase >=2.4 enforces strict JWT regex parsing. New Supabase workspaces generate non-JWT keys ('sb_publishable_', 'sb_secret_').
# We monkey-patch the regex to accept any valid string from the Supabase portal.
supabase._sync.client.re.match = lambda p, s: True
supabase._async.client.re.match = lambda p, s: True

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://cdlkfoxgeavcqlbhtulk.supabase.co")
# VERY IMPORTANT: FastAPI acts as the trusted backend engine, so it uses the highly privileged Service Role Key to bypass RLS natively, allowing workflow logic constraints to securely run here.
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

def get_db() -> Client:
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("Backend missing SUPABASE_SERVICE_ROLE_KEY inside .env")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
