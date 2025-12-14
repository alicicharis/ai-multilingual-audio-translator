from lib.eleven_labs import eleven_labs_client

def generate_audio(text: str) -> bytes:
    audio = eleven_labs_client.text_to_speech.convert(
        text=text,
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128"
    )

    return b"".join(audio)