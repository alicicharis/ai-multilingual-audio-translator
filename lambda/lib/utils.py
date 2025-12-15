import os
import subprocess
from lib.s3 import s3

bucket_name = os.getenv("AWS_BUCKET_NAME")

def get_audio_from_s3(key: str) -> tuple:
    obj = s3.get_object(Bucket=bucket_name, Key=key)
    file_data = obj['Body'].read()

    mp3_data = convert_audio_to_mp3(file_data)
    mp3_key = os.path.splitext(key)[0] + ".mp3"

    return (mp3_key, mp3_data)

def save_audio_to_s3(audio: bytes, key: str) -> dict:
    return s3.put_object(Bucket=bucket_name, Key=key, Body=audio, ContentType="audio/mp3")

def convert_audio_to_mp3(audio_data: bytes) -> bytes:
    process = subprocess.Popen(
        ["ffmpeg", "-i", "pipe:0", "-acodec", "libmp3lame", "-f", "mp3", "pipe:1"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL
    )
    mp3_data, _ = process.communicate(audio_data)
    
    return mp3_data

def extract_audio_from_video(file_data: bytes) -> bytes:
    process = subprocess.Popen(
        ["ffmpeg", "-i", "pipe:0", "-vn", "-acodec", "libmp3lame", "-f", "mp3", "pipe:1"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL
    )
    audio_data, _ = process.communicate(file_data)

    return audio_data