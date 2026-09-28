from __future__ import annotations

from typing import Any

from .db import DatabaseClient


class PortalRepository:
    """Read-only data access using predefined parameterized SQL queries."""

    def __init__(self, db: DatabaseClient):
        self.db = db

    def get_todays_birthdays(self) -> list[dict[str, Any]]:
        query = """
            SELECT slno, employee, email, display_date AS date_of_birth
            FROM (
              SELECT
                slno,
                employee,
                email,
                CASE
                  WHEN date_of_birth REGEXP '^[A-Za-z]{3}-[0-9]{2}$' THEN date_of_birth
                  ELSE DATE_FORMAT(STR_TO_DATE(date_of_birth, '%Y-%m-%d'), '%b-%d')
                END AS display_date,
                CASE
                  WHEN date_of_birth REGEXP '^[A-Za-z]{3}-[0-9]{2}$'
                    THEN DATE_FORMAT(STR_TO_DATE(CONCAT(date_of_birth, '-2000'), '%b-%d-%Y'), '%m-%d')
                  ELSE DATE_FORMAT(STR_TO_DATE(date_of_birth, '%Y-%m-%d'), '%m-%d')
                END AS md
              FROM employee_birthdays
            ) t
            WHERE md = DATE_FORMAT(CURDATE(), '%m-%d')
            ORDER BY employee ASC
        """
        return self.db.fetch_all(query)

    def get_upcoming_birthdays(self, limit: int = 10) -> list[dict[str, Any]]:
        query = """
            SELECT slno, employee, email, display_date AS date_of_birth
            FROM (
              SELECT
                slno,
                employee,
                email,
                CASE
                  WHEN date_of_birth REGEXP '^[A-Za-z]{3}-[0-9]{2}$' THEN date_of_birth
                  ELSE DATE_FORMAT(STR_TO_DATE(date_of_birth, '%%Y-%%m-%%d'), '%%b-%%d')
                END AS display_date,
                CASE
                  WHEN date_of_birth REGEXP '^[A-Za-z]{3}-[0-9]{2}$'
                    THEN DATE_FORMAT(STR_TO_DATE(CONCAT(date_of_birth, '-2000'), '%%b-%%d-%%Y'), '%%m-%%d')
                  ELSE DATE_FORMAT(STR_TO_DATE(date_of_birth, '%%Y-%%m-%%d'), '%%m-%%d')
                END AS md
              FROM employee_birthdays
            ) t
            ORDER BY
              CASE
                WHEN DATE(CONCAT(YEAR(CURDATE()), '-', md)) >= CURDATE()
                  THEN DATE(CONCAT(YEAR(CURDATE()), '-', md))
                ELSE DATE(CONCAT(YEAR(CURDATE()) + 1, '-', md))
              END,
              employee ASC
            LIMIT %s
        """
        return self.db.fetch_all(query, (max(1, min(limit, 100)),))

    def get_articles(self, limit: int = 20) -> list[dict[str, Any]]:
        query = """
            SELECT
              ArticleId, Title, Summary, Content, CoverImage, Status,
              CreatedBy, UpdatedBy, CreatedAt, UpdatedAt
            FROM articles
            WHERE Status = 'Published'
            ORDER BY UpdatedAt DESC, ArticleId DESC
            LIMIT %s
        """
        return self.db.fetch_all(query, (max(1, min(limit, 100)),))

    def get_article_details(self, article_id: int) -> list[dict[str, Any]]:
        query = """
            SELECT
              ArticleId, Title, Summary, Content, CoverImage, Status,
              CreatedBy, UpdatedBy, CreatedAt, UpdatedAt
            FROM articles
            WHERE ArticleId = %s AND Status = 'Published'
            LIMIT 1
        """
        return self.db.fetch_all(query, (article_id,))

    def get_upcoming_events(self, limit: int = 10) -> list[dict[str, Any]]:
        query = """
            SELECT
              EventId, EventName, EventType,
              DATE_FORMAT(EventDate, '%Y-%m-%d') AS EventDate,
              Location, Description
            FROM events
            WHERE IsActive = 1
              AND EventDate IS NOT NULL
              AND EventDate >= CURDATE()
            ORDER BY EventDate ASC, EventId ASC
            LIMIT %s
        """
        return self.db.fetch_all(query, (max(1, min(limit, 100)),))

    def get_portal_content(self) -> dict[str, Any]:
        content_query = """
            SELECT ContentId, ContentKey, Title, Content
            FROM portal_content
            WHERE IsPublished = 1
              AND ContentKey IN (%s, %s)
        """
        values_query = """
            SELECT ValueId, ValueText, DisplayOrder
            FROM portal_values
            WHERE IsPublished = 1
            ORDER BY DisplayOrder ASC
        """
        content_rows = self.db.fetch_all(content_query, ("mission", "vision"))
        values_rows = self.db.fetch_all(values_query)

        mission = next((r for r in content_rows if str(r.get("ContentKey", "")).lower() == "mission"), None)
        vision = next((r for r in content_rows if str(r.get("ContentKey", "")).lower() == "vision"), None)

        return {
            "mission": mission,
            "vision": vision,
            "values": values_rows,
        }

    def get_employee_corner_posts(self, limit: int = 20) -> list[dict[str, Any]]:
        query = """
            SELECT
              p.id,
              p.title,
              p.content,
              p.category,
              p.created_at,
              p.updated_at,
              u.username,
              (SELECT image_path
               FROM ec_post_images
               WHERE post_id = p.id
               ORDER BY display_order ASC
               LIMIT 1) AS image_path,
              (SELECT COUNT(*) FROM ec_likes l WHERE l.post_id = p.id) AS likes,
              (SELECT COUNT(*) FROM ec_comments c WHERE c.post_id = p.id AND c.is_deleted = 0) AS comments
            FROM ec_posts p
            JOIN users u ON p.userid = u.userid
            WHERE p.is_deleted = 0
            ORDER BY p.created_at DESC
            LIMIT %s
        """
        return self.db.fetch_all(query, (max(1, min(limit, 100)),))

