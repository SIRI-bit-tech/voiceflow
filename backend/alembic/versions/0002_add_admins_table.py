"""Add admins table

Revision ID: 0002_add_admins_table
Revises: 0001_init
Create Date: 2025-08-20 20:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0002_add_admins_table'
down_revision = '0001_init'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'admins',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('username', sa.String(length=50), unique=True, nullable=False),
        sa.Column('email', sa.String(length=100), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('is_super_admin', sa.Boolean(), default=False, nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
    )
    
    # Create indexes
    op.create_index('ix_admins_username', 'admins', ['username'], unique=True)
    op.create_index('ix_admins_email', 'admins', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_admins_email', table_name='admins')
    op.drop_index('ix_admins_username', table_name='admins')
    op.drop_table('admins')
