import cloudinary
import cloudinary.uploader
from ..core.config import settings


class CloudinaryService:
  def __init__(self) -> None:
    cloudinary.config(
      cloud_name=settings.cloudinary_cloud_name,
      api_key=settings.cloudinary_api_key,
      api_secret=settings.cloudinary_api_secret,
      secure=True,
    )

  def upload_audio(self, file_path: str, folder: str = 'voiceflow/audio') -> dict:
    return cloudinary.uploader.upload(file_path, resource_type='video', folder=folder)


