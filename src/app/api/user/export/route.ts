import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exportUserData } from "@/lib/account";

/** Downloads everything Stride stores about the signed-in user as JSON. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await exportUserData(user.id);
    const day = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="stride-data-${day}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Export failed:", e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
