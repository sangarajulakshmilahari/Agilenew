from __future__ import annotations

from contextlib import contextmanager
from typing import Any, Iterator

import pymysql
from pymysql.cursors import DictCursor

from .config import Settings


class DatabaseError(Exception):
    """Safe database error for external callers."""


class ReadOnlyViolationError(DatabaseError):
    """Raised when a non-SELECT query is attempted."""


class DatabaseClient:
    """Small reusable read-only DB layer for predefined parameterized queries."""

    def __init__(self, settings: Settings):
        self._settings = settings

    @contextmanager
    def _connection(self) -> Iterator[pymysql.connections.Connection]:
        conn = pymysql.connect(
            host=self._settings.db_host,
            port=self._settings.db_port,
            user=self._settings.db_user,
            password=self._settings.db_password,
            database=self._settings.db_name,
            cursorclass=DictCursor,
            autocommit=True,
        )
        try:
            yield conn
        finally:
            conn.close()

    @staticmethod
    def _assert_read_only(query: str) -> None:
        normalized = query.strip().lower()
        if not normalized.startswith("select"):
            raise ReadOnlyViolationError("Only read-only SELECT queries are allowed")

    def fetch_all(self, query: str, params: tuple[Any, ...] | None = None) -> list[dict[str, Any]]:
        self._assert_read_only(query)
        try:
            with self._connection() as conn:
                with conn.cursor() as cursor:
                    if params is None:
                        cursor.execute(query)
                    else:
                        cursor.execute(query, params)
                    rows = cursor.fetchall()
                    return list(rows)
        except ReadOnlyViolationError:
            raise
        except Exception as exc:  # pragma: no cover - safe wrapping
            raise DatabaseError("Database read operation failed") from exc

