import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def main():
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY is not set")
        
    client = OpenAI(api_key=openai_api_key)


if __name__ == "__main__":
    main()