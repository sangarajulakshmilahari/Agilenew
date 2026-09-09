import { NextRequest, NextResponse } from "next/server";
import { mkdir, readdir, writeFile } from "fs/promises";
import { join, extname } from "path";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/config/db";

const EVENT_IMAGES_DIR = join(process.cwd(), "public", "Eventimages");
const ALLOWED_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type EventPhotoJoinRow = RowDataPacket & {
  EventId: number;
  EventName: string;
  EventType: string | null;
  PhotoId: number | null;
  FileName: string | null;
  FilePath: string | null;
};

type EventRow = RowDataPacket & {
  EventId: number;
  IsActive: number;
};

type PhotoRow = RowDataPacket & {
  PhotoId: number;
  EventId: number;
  FileName: string;
  FilePath: string;
};

function toPublicPath(filename: string) {
  return `/Eventimages/${filename}`;
}

function getNumericBase(filename: string) {
  const base = filename.replace(extname(filename), "");
  const n = Number(base);
  return Number.isFinite(n) ? n : Number.NaN;
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
    const [rows] = await pool.execute<EventPhotoJoinRow[]>(
      `
      SELECT
        e.EventId,
        e.EventName,
        e.EventType,
        p.PhotoId,
        p.FileName,
        p.FilePath
      FROM events e
      LEFT JOIN event_photos p ON p.EventId = e.EventId
      WHERE e.IsActive = 1
      ORDER BY e.EventId ASC, p.PhotoId ASC
      `,
    );

    const events: {
      eventId: number;
      eventName: string;
      eventType?: string;
      photos: {
        photoId: number;
        fileName: string;
        filePath: string;
      }[];
    }[] = [];
    const eventIndex = new Map<number, number>();

    for (const row of rows) {
      let index = eventIndex.get(row.EventId);
      if (index === undefined) {
        index = events.length;
        eventIndex.set(row.EventId, index);
        events.push({
          eventId: row.EventId,
          eventName: row.EventName,
          eventType: row.EventType ?? undefined,
          photos: [],
        });
      }

      if (row.PhotoId && row.FileName && row.FilePath) {
        events[index].photos.push({
          photoId: row.PhotoId,
          fileName: row.FileName,
          filePath: row.FilePath,
        });
      }
    }

    return NextResponse.json({ events });
  } catch (err) {
    console.error("Failed to list event photos:", err);
    return NextResponse.json(
      { error: "Unable to list event photos" },
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

    const formData = await req.formData();
    const photo = formData.get("photo");
    const eventIdRaw = formData.get("eventId");

    if (eventIdRaw == null || String(eventIdRaw).trim() === "") {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const eventId = Number(eventIdRaw);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
    }

    const [eventRows] = await pool.execute<EventRow[]>(
      "SELECT EventId, IsActive FROM events WHERE EventId = ? LIMIT 1",
      [eventId],
    );

    if (!eventRows.length) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (Number(eventRows[0].IsActive) !== 1) {
      return NextResponse.json({ error: "Event is inactive" }, { status: 400 });
    }

    if (!(photo instanceof File)) {
      return NextResponse.json({ error: "photo file is required" }, { status: 400 });
    }

    if (photo.size <= 0) {
      return NextResponse.json({ error: "photo file is required" }, { status: 400 });
    }

    if (photo.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 10MB" },
        { status: 400 },
      );
    }

    const mime = (photo.type || "").toLowerCase();
    if (!ALLOWED_MIME.has(mime)) {
      return NextResponse.json(
        { error: "Only PNG, JPG, JPEG, and WEBP are allowed" },
        { status: 400 },
      );
    }

    await mkdir(EVENT_IMAGES_DIR, { recursive: true });
    const files = await readdir(EVENT_IMAGES_DIR);

    let maxNumeric = 0;
    for (const file of files) {
      const n = getNumericBase(file);
      if (!Number.isNaN(n) && n > maxNumeric) maxNumeric = n;
    }

    const extension = extname(photo.name)?.toLowerCase() || ".jpg";
    const safeExt = ALLOWED_EXTS.has(extension) ? extension : ".jpg";
    const filename = `${maxNumeric + 1}${safeExt}`;
    const filepath = join(EVENT_IMAGES_DIR, filename);
    const publicPath = toPublicPath(filename);

    const buffer = Buffer.from(await photo.arrayBuffer());
    await writeFile(filepath, buffer);

    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO event_photos
      (
        EventId,
        FileName,
        FilePath,
        UploadedBy,
        AIConfidence,
        AIProcessed
      )
      VALUES (?, ?, ?, ?, NULL, 0)
      `,
      [eventId, filename, publicPath, userId],
    );

    const [photoRows] = await pool.execute<PhotoRow[]>(
      `
      SELECT PhotoId, EventId, FileName, FilePath
      FROM event_photos
      WHERE PhotoId = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    const created = photoRows[0];

    return NextResponse.json({
      message: "Photo uploaded successfully",
      photo: created
        ? {
            photoId: created.PhotoId,
            eventId: created.EventId,
            fileName: created.FileName,
            filePath: created.FilePath,
          }
        : {
            photoId: result.insertId,
            eventId,
            fileName: filename,
            filePath: publicPath,
          },
    });
  } catch (err) {
    console.error("Failed to upload event photo:", err);
    return NextResponse.json(
      { error: "Unable to upload event photo" },
      { status: 500 },
    );
  }
}
