import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
import uuid

def get_s3_client():
    if settings.MINIO_URL:
        # Dev mode using MinIO
        return boto3.client(
            's3',
            endpoint_url=settings.MINIO_URL,
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            region_name='us-east-1' # Default for minio
        )
    else:
        # Prod mode using standard AWS S3
        return boto3.client(
            's3',
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
        )

def upload_file_to_s3(file_obj, filename: str, content_type: str) -> str:
    """
    Uploads a file to S3/MinIO and returns the generated object key.
    """
    s3_client = get_s3_client()
    
    # Generate unique filename
    ext = filename.split('.')[-1] if '.' in filename else 'bin'
    object_name = f"{uuid.uuid4().hex}.{ext}"

    try:
        s3_client.upload_fileobj(
            file_obj,
            settings.AWS_BUCKET_NAME,
            object_name,
            ExtraArgs={'ContentType': content_type}
        )
        return object_name
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        raise e

def get_presigned_url(object_name: str, expiration=3600) -> str:
    """
    Generate a presigned URL to share an S3 object
    """
    s3_client = get_s3_client()
    try:
        response = s3_client.generate_presigned_url('get_object',
                                                    Params={'Bucket': settings.AWS_BUCKET_NAME,
                                                            'Key': object_name},
                                                    ExpiresIn=expiration)
    except ClientError as e:
        print(f"Error generating presigned url: {e}")
        return None
    return response
