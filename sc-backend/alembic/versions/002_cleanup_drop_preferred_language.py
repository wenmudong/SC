"""cleanup: drop preferred_language column

Revision ID: 002
Revises: 001
Create Date: 2026-06-17 22:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, Sequence[str], None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """删除旧的 preferred_language 列（已迁移到 language 列）"""
    # 检查列是否存在再删除（兼容全新数据库）
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]

    if 'preferred_language' in columns:
        op.drop_column('users', 'preferred_language')


def downgrade() -> None:
    """恢复 preferred_language 列"""
    op.add_column(
        'users',
        sa.Column('preferred_language', sa.TEXT(), server_default=sa.text("'en'"), nullable=True)
    )
