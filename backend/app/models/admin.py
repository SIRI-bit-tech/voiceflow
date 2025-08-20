import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from ..db.base import Base


class Admin(Base):
    __tablename__ = "admins"
    
    id: Mapped[str] = mapped_column(sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()"))
    username: Mapped[str] = mapped_column(sa.String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(sa.String(100), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    is_super_admin: Mapped[bool] = mapped_column(sa.Boolean(), default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(sa.Boolean(), default=True, nullable=False)
    last_login: Mapped[datetime] = mapped_column(sa.DateTime(), nullable=True)
    created_at: Mapped[datetime] = mapped_column(sa.DateTime(), server_default=sa.text("NOW()"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(sa.DateTime(), server_default=sa.text("NOW()"), onupdate=sa.text("NOW()"), nullable=False)
