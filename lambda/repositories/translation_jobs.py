from lib.supabase import supabase

def update_translation_job_status(translation_job_id: str, status: str) -> dict:
    print(f"Updating here translation job status to {status} for translation job id {translation_job_id}")
    response = (
        supabase.table("translation_jobs")
        .update({'status': status})
        .eq('id', translation_job_id)
        .execute()
    )

    print(f"Response: {response}")

    if response is None:
        return None

    return response.data

def get_translation_job(translation_job_id: str) -> dict:
    response = (
        supabase.table("translation_jobs")
        .select("*, media_files(source_url, file_name, duration_seconds)")
        .eq('id', translation_job_id)
        .single()
        .execute()
    )

    if response is None:
        return None

    return response.data