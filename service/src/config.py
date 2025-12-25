import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_KEY = os.getenv('GEMINI_KEY')
GEMINI_MODEL = os.getenv('GEMINI_MODEL')

ai = genai.Client(api_key=GEMINI_KEY)
