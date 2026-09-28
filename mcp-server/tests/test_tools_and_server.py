from __future__ import annotations

import anyio

from portal_mcp.config import Settings
from portal_mcp.db import DatabaseClient
from portal_mcp.repository import PortalRepository
from portal_mcp.server import create_server
from portal_mcp.tools import PortalTools


class FakeRepository(PortalRepository):
    def __init__(self) -> None:  # type: ignore[super-init-not-called]
        pass

    def get_todays_birthdays(self):
        return [{"slno": 1, "employee": "A", "date_of_birth": "Jan-01"}]

    def get_upcoming_birthdays(self, limit: int = 10):
        return [{"slno": 2, "employee": "B", "date_of_birth": "Jan-02"}][:limit]

    def get_articles(self, limit: int = 20):
        return [{"ArticleId": 1, "Title": "T", "Summary": "S", "CoverImage": None, "Status": "Published", "UpdatedAt": None}][:limit]

    def get_article_details(self, article_id: int):
        if article_id == 1:
            return [{"ArticleId": 1, "Title": "T", "Summary": "S", "Content": "C", "CoverImage": None, "Status": "Published", "CreatedAt": None, "UpdatedAt": None}]
        return []

    def get_upcoming_events(self, limit: int = 10):
        return [{"EventId": 1, "EventName": "E", "EventType": None, "EventDate": "2026-01-01", "Location": None, "Description": None}][:limit]

    def get_portal_content(self):
        return {
            "mission": {"ContentId": 1, "ContentKey": "mission", "Title": "Mission", "Content": "M"},
            "vision": {"ContentId": 2, "ContentKey": "vision", "Title": "Vision", "Content": "V"},
            "values": [{"ValueId": 1, "ValueText": "Value", "DisplayOrder": 1}],
        }

    def get_employee_corner_posts(self, limit: int = 20):
        return [{"id": "x", "title": "Hi", "content": "Body", "category": "update", "username": "u", "image_path": None, "likes": 0, "comments": 0, "created_at": None, "updated_at": None}][:limit]


def _settings() -> Settings:
    return Settings(
        db_host="localhost",
        db_port=3306,
        db_user="root",
        db_password="root",
        db_name="agile_db",
    )


def test_tools_methods_return_data() -> None:
    tools = PortalTools(FakeRepository())

    assert tools.get_todays_birthdays()["count"] == 1
    assert tools.get_upcoming_birthdays()["count"] == 1
    assert tools.get_articles()["count"] == 1
    assert tools.get_article_details(1)["found"] is True
    assert tools.get_article_details(9)["found"] is False
    assert tools.get_upcoming_events()["count"] == 1
    assert tools.get_holidays()["count"] > 0
    assert tools.get_portal_content()["mission"]["contentKey"] == "mission"
    assert tools.get_employee_corner_posts()["count"] == 1


def test_server_registers_all_tools() -> None:
    server = create_server(_settings())
    tools = anyio.run(server.list_tools)
    names = sorted([tool.name for tool in tools])
    assert names == sorted(
        [
            "get_todays_birthdays",
            "get_upcoming_birthdays",
            "get_articles",
            "get_article_details",
            "get_upcoming_events",
            "get_holidays",
            "get_portal_content",
            "get_employee_corner_posts",
        ]
    )


def test_server_builds_with_db_layer() -> None:
    # smoke test: wiring with real classes (no DB call here)
    db = DatabaseClient(_settings())
    repo = PortalRepository(db)
    tools = PortalTools(repo)
    assert hasattr(tools, "get_articles")

