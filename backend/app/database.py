import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database URL: SQLite default with environment variable override
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "placement_predictor.db"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that provides a SQLAlchemy database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
