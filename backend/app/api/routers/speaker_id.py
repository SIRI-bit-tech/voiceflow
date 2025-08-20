from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from ...api.deps.auth import get_current_user
from ...db.session import get_db_session
from ...models.user import User
from ...models.voice_profile import VoiceProfile
from ...services.speaker_id_service import SpeakerIdService


router = APIRouter(prefix="/api/voice/speaker", tags=["speaker"]) 
svc = SpeakerIdService()


@router.get("/profile")
async def profile(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)) -> dict:
    result = await db.execute(select(VoiceProfile).where(VoiceProfile.user_id == user.id))
    vp = result.scalar_one_or_none()
    if not vp:
        raise HTTPException(404, detail="Voice profile not found")
    return {"threshold": vp.threshold, "language_pref": vp.language_pref}


@router.post("/enroll")
async def enroll(
    sample1: UploadFile = File(...),
    sample2: UploadFile = File(...),
    sample3: UploadFile = File(...),
    passphrase: str = Form(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    import hashlib, os
    os.makedirs('.cache', exist_ok=True)
    paths = []
    for i, s in enumerate([sample1, sample2, sample3], start=1):
        p = f".cache/enroll_{user.id}_{i}_{s.filename}"
        with open(p, 'wb') as f:
            f.write(await s.read())
        paths.append(p)
    emb = await svc.average_embeddings(paths)
    pass_hash = hashlib.sha256(passphrase.encode()).hexdigest()

    result = await db.execute(select(VoiceProfile).where(VoiceProfile.user_id == user.id))
    vp = result.scalar_one_or_none()
    if vp:
        vp.embeddings = {"vector": emb}
        vp.passphrase_hash = pass_hash
    else:
        vp = VoiceProfile(user_id=user.id, embeddings={"vector": emb}, passphrase_hash=pass_hash)
        db.add(vp)
    await db.commit()
    return {"status": "enrolled"}


@router.post("/verify")
async def verify(
    sample: UploadFile = File(...),
    passphrase: str = Form(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    import hashlib
    data = await db.execute(select(VoiceProfile).where(VoiceProfile.user_id == user.id))
    vp = data.scalar_one_or_none()
    if not vp:
        raise HTTPException(404, detail="No enrollment")
    p = f".cache/verify_{user.id}_{sample.filename}"
    with open(p, 'wb') as f:
        f.write(await sample.read())
    probe = await svc.embed_file(p)
    ref = vp.embeddings.get("vector")
    score = svc.cosine_similarity(ref, probe)
    ok_pass = hashlib.sha256(passphrase.encode()).hexdigest() == vp.passphrase_hash
    return {"match": score >= vp.threshold and ok_pass, "score": score}


