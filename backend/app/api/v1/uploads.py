from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.upload import UserUpload, UploadType
from app.services.s3_service import upload_file_to_s3, get_presigned_url

router = APIRouter()

@router.post("/")
def upload_image(
    type: UploadType = UploadType.GENERAL,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")

    try:
        # Upload to MinIO/S3
        object_name = upload_file_to_s3(file.file, file.filename, file.content_type)
        
        # Save record in DB
        new_upload = UserUpload(
            user_id=current_user.id,
            type=type,
            image_url=object_name
        )
        db.add(new_upload)
        db.commit()
        db.refresh(new_upload)

        # Generate a presigned URL to return immediately (optional, good for UI preview)
        presigned_url = get_presigned_url(object_name)

        return {
            "message": "Upload successful",
            "upload_id": new_upload.id,
            "object_name": object_name,
            "url": presigned_url
        }

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
