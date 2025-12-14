from lib.open_ai import open_ai_client
from repositories.transcripts import get_transcript, save_transcript

def transcribe_audio(audio_file: tuple, media_file_id: str) -> str:
    file_name, file_data = audio_file

    transcript = get_transcript(media_file_id)

    if transcript:
        return transcript['transcript_text']

    response = open_ai_client.audio.transcriptions.create(model="gpt-4o-transcribe", file=(file_name, file_data))

    save_transcript(media_file_id, response.text)

    return response.text

def translate_text(text: str, desired_language: str) -> str:
    response = open_ai_client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Translate the following text to {desired_language}: {text}"}])

    return response.choices[0].message.content