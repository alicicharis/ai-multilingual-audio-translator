from elevenlabs.client import ElevenLabs
import os

api_key = os.getenv("ELEVEN_LABS_API_KEY")

eleven_labs_client = ElevenLabs(
    api_key=api_key
)