import { NextRequest, NextResponse } from "next/server";
import { getAutomation } from "@/lib/automationJobs";
import { isLocalRequest } from "@/lib/localRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  if (!isLocalRequest(request)) {
    return NextResponse.json({ error: "Automation is available only on localhost." }, { status: 403 });
  }
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const job = getAutomation(id);
  return job
    ? NextResponse.json(job)
    : NextResponse.json({ error: "Automation job not found." }, { status: 404 });
}
