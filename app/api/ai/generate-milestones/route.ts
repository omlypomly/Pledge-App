import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateMilestones } from "@/lib/ai/verification";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goalDescription, durationMonths, goalType } = await req.json();

  if (!goalDescription || !durationMonths || !goalType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const milestones = await generateMilestones(goalDescription, durationMonths, goalType);
    return NextResponse.json({ milestones });
  } catch (err) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
