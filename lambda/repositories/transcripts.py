from lib.supabase import supabase

def save_transcript(media_file_id: str, transcript: str) -> dict:
    response = (
            supabase.table("transcripts").insert({
                "media_file_id": media_file_id,
                "transcript_text": transcript,
            }).execute()
    )

    if response is None:
        return None

    return response.data

def get_transcript(media_file_id: str) -> dict:
    response = (
        supabase.table("transcripts")
        .select("*")
        .eq('media_file_id', media_file_id)
        .maybe_single()
        .execute()
    )

    if response is None:
        return None

    return response.data