from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from portal_mcp.config import Settings
from portal_mcp.db import DatabaseClient, DatabaseError, ReadOnlyViolationError


def _settings() -> Settings:
    return Settings(
        db_host="localhost",
        db_port=3306,
        db_user="user",
        db_password="pass",
        db_name="agile_db",
    )


def test_fetch_all_rejects_non_select() -> None:
    db = DatabaseClient(_settings())
    with pytest.raises(ReadOnlyViolationError):
        db.fetch_all("UPDATE users SET username=%s", ("x",))


def test_fetch_all_runs_select_query() -> None:
    db = DatabaseClient(_settings())

    fake_cursor = MagicMock()
    fake_cursor.fetchall.return_value = [{"k": "v"}]
    fake_conn = MagicMock()

    fake_conn.cursor.return_value.__enter__.return_value = fake_cursor

    with patch("portal_mcp.db.pymysql.connect", return_value=fake_conn):
        rows = db.fetch_all("SELECT 1", ())

    assert rows == [{"k": "v"}]
    fake_cursor.execute.assert_called_once_with("SELECT 1", ())


def test_fetch_all_wraps_db_error() -> None:
    db = DatabaseClient(_settings())
    with patch("portal_mcp.db.pymysql.connect", side_effect=RuntimeError("boom")):
        with pytest.raises(DatabaseError):
            db.fetch_all("SELECT 1", ())

