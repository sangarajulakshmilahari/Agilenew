import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/config/db";
import { requireHrUser } from "@/app/api/lib/requireHr";

type ValueRow = RowDataPacket & {
  ValueId: number;
  ValueText: string;
  DisplayOrder: number;
};

function mapValue(row: ValueRow) {
  return {
    valueId: row.ValueId,
    valueText: row.ValueText,
    displayOrder: row.DisplayOrder,
  };
}

function parseBody(raw: unknown) {
  return raw as {
    valueId?: unknown;
    valueText?: unknown;
    displayOrder?: unknown;
  };
}

export async function POST(req: NextRequest) {
  const auth = await requireHrUser(req);
  if ("error" in auth) return auth.error;

  try {
    let body: ReturnType<typeof parseBody>;
    try {
      body = parseBody(await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const valueText = String(body.valueText ?? "").trim();
    if (!valueText) {
      return NextResponse.json({ error: "Value text is required" }, { status: 400 });
    }
    if (valueText.length > 500) {
      return NextResponse.json(
        { error: "Value text must be 500 characters or fewer" },
        { status: 400 },
      );
    }

    let displayOrder: number | null = null;
    if (body.displayOrder != null && String(body.displayOrder).trim() !== "") {
      displayOrder = Number(body.displayOrder);
      if (!Number.isInteger(displayOrder) || displayOrder < 1) {
        return NextResponse.json(
          { error: "Display order must be a positive integer" },
          { status: 400 },
        );
      }
    }

    if (displayOrder == null) {
      const [maxRows] = await pool.execute<RowDataPacket[]>(
        "SELECT COALESCE(MAX(DisplayOrder), 0) AS maxOrder FROM portal_values",
      );
      displayOrder = Number(maxRows[0]?.maxOrder || 0) + 1;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO portal_values
      (ValueText, DisplayOrder, IsPublished, CreatedBy, UpdatedBy)
      VALUES (?, ?, 1, ?, ?)
      `,
      [valueText, displayOrder, auth.userId, auth.userId],
    );

    const [createdRows] = await pool.execute<ValueRow[]>(
      `
      SELECT ValueId, ValueText, DisplayOrder
      FROM portal_values
      WHERE ValueId = ?
      LIMIT 1
      `,
      [result.insertId],
    );

    return NextResponse.json({ value: mapValue(createdRows[0]) }, { status: 201 });
  } catch (err) {
    console.error("Failed to create portal value:", err);
    return NextResponse.json(
      { error: "Unable to create value" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireHrUser(req);
  if ("error" in auth) return auth.error;

  try {
    let body: ReturnType<typeof parseBody>;
    try {
      body = parseBody(await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const valueId = Number(body.valueId);
    if (!Number.isInteger(valueId) || valueId <= 0) {
      return NextResponse.json({ error: "valueId is required" }, { status: 400 });
    }

    const valueText = String(body.valueText ?? "").trim();
    if (!valueText) {
      return NextResponse.json({ error: "Value text is required" }, { status: 400 });
    }
    if (valueText.length > 500) {
      return NextResponse.json(
        { error: "Value text must be 500 characters or fewer" },
        { status: 400 },
      );
    }

    let displayOrder: number | undefined;
    if (body.displayOrder != null && String(body.displayOrder).trim() !== "") {
      displayOrder = Number(body.displayOrder);
      if (!Number.isInteger(displayOrder) || displayOrder < 1) {
        return NextResponse.json(
          { error: "Display order must be a positive integer" },
          { status: 400 },
        );
      }
    }

    const [existingRows] = await pool.execute<ValueRow[]>(
      `
      SELECT ValueId, ValueText, DisplayOrder
      FROM portal_values
      WHERE ValueId = ?
      LIMIT 1
      `,
      [valueId],
    );

    if (!existingRows.length) {
      return NextResponse.json({ error: "Value not found" }, { status: 404 });
    }

    const nextOrder = displayOrder ?? existingRows[0].DisplayOrder;

    await pool.execute<ResultSetHeader>(
      `
      UPDATE portal_values
      SET ValueText = ?, DisplayOrder = ?, UpdatedBy = ?
      WHERE ValueId = ?
      `,
      [valueText, nextOrder, auth.userId, valueId],
    );

    const [updatedRows] = await pool.execute<ValueRow[]>(
      `
      SELECT ValueId, ValueText, DisplayOrder
      FROM portal_values
      WHERE ValueId = ?
      LIMIT 1
      `,
      [valueId],
    );

    return NextResponse.json({ value: mapValue(updatedRows[0]) });
  } catch (err) {
    console.error("Failed to update portal value:", err);
    return NextResponse.json(
      { error: "Unable to update value" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireHrUser(req);
  if ("error" in auth) return auth.error;

  try {
    let body: ReturnType<typeof parseBody>;
    try {
      body = parseBody(await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const valueId = Number(body.valueId);
    if (!Number.isInteger(valueId) || valueId <= 0) {
      return NextResponse.json({ error: "valueId is required" }, { status: 400 });
    }

    const [existingRows] = await pool.execute<RowDataPacket[]>(
      "SELECT ValueId FROM portal_values WHERE ValueId = ? LIMIT 1",
      [valueId],
    );

    if (!existingRows.length) {
      return NextResponse.json({ error: "Value not found" }, { status: 404 });
    }

    await pool.execute<ResultSetHeader>(
      "DELETE FROM portal_values WHERE ValueId = ?",
      [valueId],
    );

    return NextResponse.json({ message: "Value deleted" });
  } catch (err) {
    console.error("Failed to delete portal value:", err);
    return NextResponse.json(
      { error: "Unable to delete value" },
      { status: 500 },
    );
  }
}
