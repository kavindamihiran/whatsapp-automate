import { NextRequest, NextResponse } from "next/server";
import { startAutomation } from "@/lib/automationJobs";
import { isLocalRequest } from "@/lib/localRequest";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isLocalRequest(request)) {
    return NextResponse.json({ error: "Automation is available only on localhost." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      numbers?: unknown;
      message?: unknown;
      delay?: unknown;
    };
    const numbers = Array.isArray(body.numbers)
      ? body.numbers.filter((number): number is string => typeof number === "string")
      : [];
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const delay = typeof body.delay === "number" ? body.delay : 5;

    if (numbers.length === 0 || numbers.length > 50) {
      return NextResponse.json({ error: "Use between 1 and 50 valid recipients." }, { status: 400 });
    }
    if (numbers.some((number) => !/^\+947[1-9]\d{7}$/.test(number))) {
      return NextResponse.json({ error: "One or more phone numbers are invalid." }, { status: 400 });
    }
    if (!message || message.length > 4096) {
      return NextResponse.json({ error: "Message must contain 1–4096 characters." }, { status: 400 });
    }
    if (!Number.isFinite(delay) || delay < 3 || delay > 30) {
      return NextResponse.json({ error: "Delay must be between 3 and 30 seconds." }, { status: 400 });
    }

    return NextResponse.json(startAutomation({ numbers, message, delay }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start automation.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
