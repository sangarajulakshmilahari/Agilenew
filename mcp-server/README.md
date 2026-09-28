# Agile Sourcing Portal MCP Server

Read-only Python MCP server for the Agile Sourcing Portal database.

## 1) Create virtual environment

```bash
python -m venv .venv
.venv\Scripts\activate
```

## 2) Install dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

## 3) Environment variables

Copy `.env.example` and set values:

```bash
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=

MCP_HOST=0.0.0.0
MCP_PORT=8031
MCP_TRANSPORT=streamable-http
MCP_PATH=/mcp
```

Required DB variables are loaded in `src/portal_mcp/config.py`.

## 4) Start MCP server

```bash
python -m portal_mcp.main
```

## 5) MCP transport / endpoint

- Default transport: `streamable-http`
- Default host: `0.0.0.0`
- Default port: `8031`
- Default path: `/mcp`

Default endpoint:

`http://localhost:8031/mcp`

## 6) Available tools (read-only)

1. `get_todays_birthdays`
2. `get_upcoming_birthdays`
3. `get_articles`
4. `get_article_details`
5. `get_upcoming_events`
6. `get_holidays`
7. `get_portal_content`
8. `get_employee_corner_posts`

## 7) Run tests

```bash
pytest
```

Tests cover:
- read-only DB guard (no write SQL)
- query/tool mapping behavior with mocks
- MCP tool registration
- server wiring smoke checks

