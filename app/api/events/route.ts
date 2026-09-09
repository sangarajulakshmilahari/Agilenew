import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/config/db";

type EventRow = RowDataPacket & {
  EventId: number;
  EventName: string;
  EventType: string | null;
  EventDate: Date | string | null;
  Location: string | null;
  Description: string | null;
};

function formatEventDate(value: Date | string | null): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  return text;
}

function mapEvent(row: EventRow) {
  return {
    eventId: row.EventId,
    eventName: row.EventName,
    eventType: row.EventType,
    eventDate: formatEventDate(row.EventDate),
    location: row.Location,
    description: row.Description,
  };
}

async function getAuthenticatedUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );
    const keycloakId = decoded?.sub;
    if (!keycloakId) return null;

    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT userid FROM users WHERE keycloak_id = ?",
      [keycloakId],
    );

    if (!userRows.length) return null;
    return Number(userRows[0].userid);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const [rows] = await pool.execute<EventRow[]>(
      `
      SELECT EventId, EventName, EventType, DATE_FORMAT(EventDate, '%Y-%m-%d') AS EventDate, Location, Description
      FROM events
      WHERE IsActive = 1
      ORDER BY EventId DESC
      `,
    );

    return NextResponse.json({
      events: rows.map((row) => ({
        eventId: row.EventId,
        eventName: row.EventName,
      })),
    });
  } catch (err) {
    console.error("Failed to list events:", err);
    return NextResponse.json(
      { error: "Unable to load events" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [roleRows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT LOWER(r.role_name) AS role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.role_id
      WHERE ur.userid = ?
      `,
      [userId],
    );

    const isHr = roleRows.some((row) => String(row.role_name) === "hr");
    if (!isHr) {
      return NextResponse.json(
        { error: "Only HR can create events" },
        { status: 403 },
      );
    }

    let body: {
      eventName?: unknown;
      eventType?: unknown;
      eventDate?: unknown;
      location?: unknown;
      description?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const eventName = String(body.eventName ?? "").trim();
    if (!eventName) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 });
    }
    if (eventName.length > 150) {
      return NextResponse.json(
        { error: "Event name must be 150 characters or fewer" },
        { status: 400 },
      );
    }

    const eventType = String(body.eventType ?? "").trim() || null;
    const location = String(body.location ?? "").trim() || null;
    const description = String(body.description ?? "").trim() || null;
    const eventDateRaw = String(body.eventDate ?? "").trim();

    if (eventType && eventType.length > 50) {
      return NextResponse.json(
        { error: "Event type must be 50 characters or fewer" },
        { status: 400 },
      );
    }
    if (location && location.length > 150) {
      return NextResponse.json(
        { error: "Location must be 150 characters or fewer" },
        { status: 400 },
      );
    }
    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Description must be 500 characters or fewer" },
        { status: 400 },
      );
    }

    let eventDate: string | null = null;
    if (eventDateRaw) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDateRaw)) {
        return NextResponse.json(
          { error: "Event date must be in YYYY-MM-DD format" },
          { status: 400 },
        );
      }
      eventDate = eventDateRaw;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO events
      (
        EventName,
        EventType,
        EventDate,
        Location,
        Description,
        IsActive
      )
      VALUES (?, ?, ?, ?, ?, 1)
      `,
      [eventName, eventType, eventDate, location, description],
    );

    const eventId = result.insertId;
    const [createdRows] = await pool.execute<EventRow[]>(
      `
      SELECT EventId, EventName, EventType, DATE_FORMAT(EventDate, '%Y-%m-%d') AS EventDate, Location, Description
      FROM events
      WHERE EventId = ?
      LIMIT 1
      `,
      [eventId],
    );

    const created = createdRows[0];
    if (!created) {
      return NextResponse.json(
        { error: "Unable to create event" },
        { status: 500 },
      );
    }

    return NextResponse.json({ event: mapEvent(created) }, { status: 201 });
  } catch (err) {
    console.error("Failed to create event:", err);
    return NextResponse.json(
      { error: "Unable to create event" },
      { status: 500 },
    );
  }
}
