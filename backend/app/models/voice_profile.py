import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column
from ..db.session import Base
from sqlalchemy.dialects.postgresql import UUID


class VoiceProfile(Base):
    __tablename__ = "voice_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    language_pref: Mapped[str] = mapped_column(String(10), default="en")
    passphrase_hash: Mapped[str] = mapped_column(String(255))
    embeddings: Mapped[dict] = mapped_column(JSON, default=dict)
    threshold: Mapped[float] = mapped_column(default=0.75)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


