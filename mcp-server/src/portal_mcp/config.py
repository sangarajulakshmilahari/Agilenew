from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    db_host: str
    db_port: int
    db_user: str
    db_password: str
    db_name: str
    mcp_host: str = "0.0.0.0"
    mcp_port: int = 8031
    mcp_transport: str = "streamable-http"
    mcp_path: str = "/mcp"


def _load_dotenv_file() -> None:
    """Load key/value pairs from mcp-server/.env into process env if not already set."""
    dotenv_path = Path(__file__).resolve().parents[2] / ".env"
    if not dotenv_path.exists():
        return

    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        if key:
            os.environ.setdefault(key, value)


def _require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(f"Missing required environment variable: {name}")
    return value


def load_settings() -> Settings:
    _load_dotenv_file()

    return Settings(
        db_host=_require_env("DB_HOST"),
        db_port=int(os.getenv("DB_PORT", "3306")),
        db_user=_require_env("DB_USER"),
        db_password=_require_env("DB_PASSWORD"),
        db_name=_require_env("DB_NAME"),
        mcp_host=os.getenv("MCP_HOST", "0.0.0.0").strip() or "0.0.0.0",
        mcp_port=int(os.getenv("MCP_PORT", "8031")),
        mcp_transport=os.getenv("MCP_TRANSPORT", "streamable-http").strip() or "streamable-http",
        mcp_path=os.getenv("MCP_PATH", "/mcp").strip() or "/mcp",
    )

