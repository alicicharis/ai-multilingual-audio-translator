import json
import logging
from dotenv import load_dotenv

load_dotenv()

from repositories.translation_jobs import get_translation_job, update_translation_job_status
from ai.open_ai import transcribe_audio, translate_text
from ai.eleven_labs import generate_audio
from repositories.generated_audio import save_generated_audio
from lib.utils import get_audio_from_s3, save_audio_to_s3

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def lambda_handler(event, context):
    logger.info(f"Event: {event}")
    request_body = json.loads(event['Records'][0]['body'])
    try:
        media_file_id = request_body['mediaFileId']
        target_language = request_body['targetLanguage']
        translation_job_id = request_body['translationJobId']
        user_id = request_body['userId']

        if not media_file_id or not target_language or not translation_job_id or not user_id:
            logger.error(F"Media file ID or target language or translation job ID or user ID is missing")
            return
        
        translation_job = get_translation_job(translation_job_id)
        file_name = translation_job['media_files']['file_name']

        if not translation_job:
            logger.error(F"Translation job not found")
            return

        logger.info(f"Processing translation job with id: {translation_job_id} and target language: {target_language}")

        update_translation_job_status(translation_job_id, 'processing')

        audio_file = get_audio_from_s3(file_name)
        transcribed_text = transcribe_audio(audio_file, media_file_id)
        translated_text = translate_text(transcribed_text, target_language)
        audio = generate_audio(translated_text)

        new_file_name = file_name + "_" + target_language

        save_audio_to_s3(audio, new_file_name) 
        duration_seconds = len(audio) // 16000
        save_generated_audio(translation_job_id, new_file_name, duration_seconds, user_id)
        update_translation_job_status(translation_job_id, 'completed')

    except Exception as e:
        logger.error(f"Error: {e}")
        update_translation_job_status(translation_job_id, 'failed')
        return

# if __name__ == "__main__":
#     lambda_handler({"Records": [{"body": json.dumps({"translationJobId": "cd1fc036-d640-47f5-ad65-0dd00356441e", "mediaFileId": "ea3035fa-53fc-40d3-9b67-9b5446c7c996", "targetLanguage": "English", "userId": "150512e1-4ff7-43a8-9b95-db69139a381a"})}]})