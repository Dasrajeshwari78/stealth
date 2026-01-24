import cloudinary
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    # cloudName="your_cloud_name",
    cloudName = os.getenv('CLOUDINARY_CLOUD_NAME'),
    apiKey = os.getenv('CLOUDINARY_API_KEY'),
    apiSecret = os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)
