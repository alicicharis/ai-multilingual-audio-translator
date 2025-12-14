from lib.supabase import supabase

def save_generated_audio(translation_job_id: str, file_name: str, duration_seconds: int, user_id: str) -> dict:
    response = (
        supabase.table("generated_audio").insert({
            "translation_job_id": translation_job_id,
            "file_name": file_name,
            "duration_seconds": duration_seconds,
            "tts_provider": "eleven_labs",
            "voice_id": "JBFqnCBsd6RMkjVDRZzb",
            "user_id": user_id,
        }).execute()
    )

    if response is None:
        return None

    return response.data