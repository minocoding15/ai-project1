import os
from sqlmodel import create_engine, SQLModel, Session

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./backend.db")

# When using SQLite in multi-threaded web servers, disable same-thread check
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
