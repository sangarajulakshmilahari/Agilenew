from __future__ import annotations

from typing import Any

from .repository import PortalRepository


HOLIDAYS_2026 = [
    {"date": "01 January", "day": "Thursday", "name": "New Year", "month": "Jan"},
    {"date": "14 January", "day": "Wednesday", "name": "Bhogi", "month": "Jan"},
    {"date": "15 January", "day": "Thursday", "name": "Sankranthi", "month": "Jan"},
    {"date": "26 January", "day": "Monday", "name": "Republic Day", "month": "Jan"},
    {"date": "19 March", "day": "Thursday", "name": "Ugadi (Telugu New Year)", "month": "Mar"},
    {"date": "27 March", "day": "Friday", "name": "Sri Rama Navami", "month": "Mar"},
    {"date": "14 September", "day": "Monday", "name": "Ganesh Chaturthi", "month": "Sep"},
    {"date": "02 October", "day": "Friday", "name": "Gandhi Jayanthi", "month": "Oct"},
    {"date": "20 October", "day": "Tuesday", "name": "Vijaya Dashami", "month": "Oct"},
    {"date": "25 December", "day": "Friday", "name": "Christmas", "month": "Dec"},
]


class PortalTools:
    """Read-only tool implementations built on repository queries."""

    def __init__(self, repository: PortalRepository):
        self.repo = repository

    def get_todays_birthdays(self) -> dict[str, Any]:
        rows = self.repo.get_todays_birthdays()
        # Keep response privacy-friendly by avoiding direct email exposure.
        birthdays = [
            {
                "slno": row.get("slno"),
                "employee": row.get("employee"),
                "date_of_birth": row.get("date_of_birth"),
            }
            for row in rows
        ]
        return {"count": len(birthdays), "birthdays": birthdays}

    def get_upcoming_birthdays(self, limit: int = 10) -> dict[str, Any]:
        rows = self.repo.get_upcoming_birthdays(limit=limit)
        birthdays = [
            {
                "slno": row.get("slno"),
                "employee": row.get("employee"),
                "date_of_birth": row.get("date_of_birth"),
            }
            for row in rows
        ]
        return {"count": len(birthdays), "birthdays": birthdays}

    def get_articles(self, limit: int = 20) -> dict[str, Any]:
        rows = self.repo.get_articles(limit=limit)
        articles = [
            {
                "articleId": row.get("ArticleId"),
                "title": row.get("Title"),
                "summary": row.get("Summary"),
                "coverImage": row.get("CoverImage"),
                "status": row.get("Status"),
                "updatedAt": str(row.get("UpdatedAt")) if row.get("UpdatedAt") is not None else None,
            }
            for row in rows
        ]
        return {"count": len(articles), "articles": articles}

    def get_article_details(self, article_id: int) -> dict[str, Any]:
        rows = self.repo.get_article_details(article_id=article_id)
        if not rows:
            return {"found": False, "article": None}

        row = rows[0]
        article = {
            "articleId": row.get("ArticleId"),
            "title": row.get("Title"),
            "summary": row.get("Summary"),
            "content": row.get("Content"),
            "coverImage": row.get("CoverImage"),
            "status": row.get("Status"),
            "createdAt": str(row.get("CreatedAt")) if row.get("CreatedAt") is not None else None,
            "updatedAt": str(row.get("UpdatedAt")) if row.get("UpdatedAt") is not None else None,
        }
        return {"found": True, "article": article}

    def get_upcoming_events(self, limit: int = 10) -> dict[str, Any]:
        rows = self.repo.get_upcoming_events(limit=limit)
        events = [
            {
                "eventId": row.get("EventId"),
                "eventName": row.get("EventName"),
                "eventType": row.get("EventType"),
                "eventDate": row.get("EventDate"),
                "location": row.get("Location"),
                "description": row.get("Description"),
            }
            for row in rows
        ]
        return {"count": len(events), "events": events}

    def get_holidays(self) -> dict[str, Any]:
        # Existing portal holiday data is currently static in frontend component.
        return {"year": 2026, "count": len(HOLIDAYS_2026), "holidays": HOLIDAYS_2026}

    def get_portal_content(self) -> dict[str, Any]:
        raw = self.repo.get_portal_content()

        def _map_content(row: dict[str, Any] | None) -> dict[str, Any] | None:
            if not row:
                return None
            return {
                "contentId": row.get("ContentId"),
                "contentKey": row.get("ContentKey"),
                "title": row.get("Title"),
                "content": row.get("Content"),
            }

        values = [
            {
                "valueId": row.get("ValueId"),
                "valueText": row.get("ValueText"),
                "displayOrder": row.get("DisplayOrder"),
            }
            for row in raw.get("values", [])
        ]

        return {
            "mission": _map_content(raw.get("mission")),
            "vision": _map_content(raw.get("vision")),
            "values": values,
        }

    def get_employee_corner_posts(self, limit: int = 20) -> dict[str, Any]:
        rows = self.repo.get_employee_corner_posts(limit=limit)
        posts = [
            {
                "id": row.get("id"),
                "title": row.get("title"),
                "content": row.get("content"),
                "category": row.get("category"),
                "username": row.get("username"),
                "image_path": row.get("image_path"),
                "likes": int(row.get("likes") or 0),
                "comments": int(row.get("comments") or 0),
                "created_at": str(row.get("created_at")) if row.get("created_at") is not None else None,
                "updated_at": str(row.get("updated_at")) if row.get("updated_at") is not None else None,
            }
            for row in rows
        ]
        return {"count": len(posts), "posts": posts}

