from __future__ import annotations

from mcp.server.mcpserver import MCPServer

from .config import Settings
from .db import DatabaseClient, DatabaseError
from .repository import PortalRepository
from .tools import PortalTools


def create_server(settings: Settings) -> MCPServer:
    server = MCPServer(
        name="agile-sourcing-portal-mcp",
        title="Agile Sourcing Portal MCP Server",
        description="Read-only MCP tools for Agile Sourcing Portal",
    )

    db_client = DatabaseClient(settings)
    repository = PortalRepository(db_client)
    tools = PortalTools(repository)

    @server.tool(name="get_todays_birthdays", description="Get birthdays for today")
    def get_todays_birthdays() -> dict:
        try:
            return tools.get_todays_birthdays()
        except DatabaseError:
            return {"error": "Failed to fetch birthdays"}

    @server.tool(name="get_upcoming_birthdays", description="Get upcoming birthdays")
    def get_upcoming_birthdays(limit: int = 10) -> dict:
        try:
            return tools.get_upcoming_birthdays(limit=limit)
        except DatabaseError:
            return {"error": "Failed to fetch birthdays"}

    @server.tool(name="get_articles", description="Get published articles")
    def get_articles(limit: int = 20) -> dict:
        try:
            return tools.get_articles(limit=limit)
        except DatabaseError:
            return {"error": "Failed to fetch articles"}

    @server.tool(name="get_article_details", description="Get one published article by article ID")
    def get_article_details(article_id: int) -> dict:
        if article_id <= 0:
            return {"error": "article_id must be greater than 0"}
        try:
            return tools.get_article_details(article_id=article_id)
        except DatabaseError:
            return {"error": "Failed to fetch article details"}

    @server.tool(name="get_upcoming_events", description="Get upcoming active events")
    def get_upcoming_events(limit: int = 10) -> dict:
        try:
            return tools.get_upcoming_events(limit=limit)
        except DatabaseError:
            return {"error": "Failed to fetch events"}

    @server.tool(name="get_holidays", description="Get holiday calendar data")
    def get_holidays() -> dict:
        return tools.get_holidays()

    @server.tool(name="get_portal_content", description="Get published mission, vision, and portal values")
    def get_portal_content() -> dict:
        try:
            return tools.get_portal_content()
        except DatabaseError:
            return {"error": "Failed to fetch portal content"}

    @server.tool(name="get_employee_corner_posts", description="Get latest employee corner posts")
    def get_employee_corner_posts(limit: int = 20) -> dict:
        try:
            return tools.get_employee_corner_posts(limit=limit)
        except DatabaseError:
            return {"error": "Failed to fetch employee corner posts"}

    return server

