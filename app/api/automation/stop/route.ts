import { NextRequest, NextResponse } from "next/server";
import { stopAutomation } from "@/lib/automationJobs";
import { isLocalRequest } from "@/lib/localRequest";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isLocalRequest(request)) {
    return NextResponse.json({ error: "Automation is available only on localhost." }, { status: 403 });
  }
  const body = (await request.json()) as { id?: unknown };
  const job = typeof body.id === "string" ? stopAutomation(body.id) : null;
  return job
    ? NextResponse.json(job)
    : NextResponse.json({ error: "Automation job not found." }, { status: 404 });
}
