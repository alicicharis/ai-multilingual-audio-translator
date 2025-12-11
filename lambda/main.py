import os
from dotenv import load_dotenv
from open_ai import open_ai_client
import subprocess
from s3 import s3
import logging
from eleven_labs import eleven_labs_client

load_dotenv()

logger = logging.getLogger(__name__)

def main():
    desired_language = "spanish"
    key = "audio.mp3"

    logger.info(f"Processing file with key: {key} and desired language: {desired_language}")
    bucket_name = os.getenv("AWS_BUCKET_NAME")

    audio_file = stream_from_s3(bucket_name, key)

    transcribed_text = transcribe_audio(audio_file)
    translated_text = translate_text(transcribed_text, desired_language)

    audio = eleven_labs_client.text_to_speech.convert(
        text=translated_text,
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128"
    )

    audio_bytes = b"".join(audio)

    upload_response = save_audio_to_s3(audio_bytes, bucket_name, desired_language + '_' + key)
    logger.info(f"Upload response: {upload_response}")

    return

def transcribe_audio(audio_file: tuple) -> str:
    file_name, file_data = audio_file

    response = open_ai_client.audio.transcriptions.create(model="gpt-4o-transcribe", file=(file_name, file_data))

    return response.text

def translate_text(text: str, desired_language: str) -> str:
    response = open_ai_client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Translate the following text to {desired_language}: {text}"}])

    return response.choices[0].message.content

def stream_from_s3(bucket_name: str, key: str) -> tuple:
    obj = s3.get_object(Bucket=bucket_name, Key=key)
    file_data = obj['Body'].read()

    return (key, file_data)

def save_audio_to_s3(audio: bytes, bucket_name: str, key: str) -> dict:
    return s3.put_object(Bucket=bucket_name, Key=key, Body=audio)

def extract_audio_from_video(file_data: bytes) -> bytes:
    process = subprocess.Popen(
        ["ffmpeg", "-i", "pipe:0", "-vn", "-acodec", "libmp3lame", "-f", "mp3", "pipe:1"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL
    )
    audio_data, _ = process.communicate(file_data)
    return audio_data

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()