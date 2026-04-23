import { NextResponse } from "next/server";
import pool from "../../../config/db";

export async function GET() {
  try {
   const [rows] = await pool.query(`
      SELECT slno, employee, email, display_date AS date_of_birth
      FROM (
        SELECT
          slno,
          employee,
          email,
          /* ── display label (always 'Mon-DD') ── */
          CASE
            WHEN date_of_birth REGEXP '^[A-Za-z]{3}-[0-9]{2}$'
              THEN date_of_birth
            ELSE DATE_FORMAT(date_of_birth, '%b-%d')
          END AS display_date,

          /* ── sortable 'MM-DD' string ── */
          CASE
            WHEN date_of_birth REGEXP '^[A-Za-z]{3}-[0-9]{2}$'
              THEN DATE_FORMAT(
                     STR_TO_DATE(CONCAT(date_of_birth, '-2000'), '%b-%d-%Y'),
                     '%m-%d'
                   )
            ELSE DATE_FORMAT(date_of_birth, '%m-%d')
          END AS md

        FROM employee_birthdays
      ) t

      /* ── bring future birthdays first, wrap around year-end ── */
      ORDER BY
        CASE
          WHEN DATE(CONCAT(YEAR(CURDATE()), '-', md)) >= CURDATE()
            THEN DATE(CONCAT(YEAR(CURDATE()),     '-', md))
          ELSE   DATE(CONCAT(YEAR(CURDATE()) + 1, '-', md))
        END
      LIMIT 3;
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching birthdays:", error);
    return NextResponse.json(
      { error: "Failed to fetch birthdays" },
      { status: 500 }
    );
  }
}
