from typing import Generator
from sqlmodel import Session, create_engine
from app.config import settings

connect_args = {"check_same_thread": False} if "sqlite" in settings.database_url else {}
engine = create_engine(settings.database_url, echo=settings.debug, connect_args=connect_args)


def get_db() -> Generator[Session, None, None]:
    db = Session(engine)
    try:
        yield db
    finally:
        db.close()
