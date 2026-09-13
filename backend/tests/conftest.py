import pytest
from fastapi.testclient import TestClient
from app.core.database import Base, engine, SessionLocal, get_db
from app.main import app
from app.seed.seed_data import seed_database


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    seed_database(force=False)
    yield


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

