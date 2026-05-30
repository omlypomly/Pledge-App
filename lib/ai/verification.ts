import OpenAI from "openai";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "placeholder" });
}

export interface VerificationResult {
  confidence: number;
  approved: boolean;
  analysis: string;
  flags: string[];
  riskScore: number;
}

export async function verifyMilestoneProof(
  imageUrls: string[],
  milestoneDescription: string,
  goalType: string,
  targetValue?: number,
  targetUnit?: string
): Promise<VerificationResult> {
  const target = targetValue ? `${targetValue} ${targetUnit || ""}` : "";
  const prompt = `You are a strict milestone verification AI for a fitness/accountability challenge platform.

Analyze the provided proof image(s) for the following milestone:
- Goal Type: ${goalType}
- Milestone: ${milestoneDescription}
${target ? `- Target: ${target}` : ""}

Evaluate:
1. Does the image clearly show proof of the milestone completion?
2. Is the image authentic (not edited, not a stock photo, recent timestamp if visible)?
3. What is your confidence level (0-100) that this milestone was completed?
4. Are there any red flags (duplicate, edited, wrong type of proof)?

Return a JSON object with:
- confidence: number (0-100)
- approved: boolean (true if confidence >= 80)
- analysis: string (brief explanation)
- flags: string[] (any concerns or red flags)
- riskScore: number (0-100, higher = more suspicious)`;

  try {
    const imageContent = imageUrls.map((url) => ({
      type: "image_url" as const,
      image_url: { url, detail: "high" as const },
    }));

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imageContent,
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const result = JSON.parse(content) as VerificationResult;
    return {
      confidence: Math.max(0, Math.min(100, result.confidence || 0)),
      approved: result.confidence >= 80,
      analysis: result.analysis || "Analysis unavailable",
      flags: result.flags || [],
      riskScore: Math.max(0, Math.min(100, result.riskScore || 0)),
    };
  } catch (error) {
    console.error("AI verification error:", error);
    return {
      confidence: 0,
      approved: false,
      analysis: "AI verification temporarily unavailable",
      flags: ["ai_unavailable"],
      riskScore: 50,
    };
  }
}

export async function generateMilestones(
  goalDescription: string,
  durationMonths: number,
  goalType: string
): Promise<Array<{ title: string; description: string; targetValue?: number; targetUnit?: string; weekIndex: number }>> {
  const prompt = `You are a goal-setting expert for a challenge platform.

Generate exactly ${durationMonths} milestones for this goal:
- Goal: ${goalDescription}
- Type: ${goalType}
- Duration: ${durationMonths} months

Each milestone should be evenly spaced (one per month) and progressively harder.

Return a JSON array with ${durationMonths} objects, each having:
- title: string (short milestone name)
- description: string (what needs to be proven)
- targetValue: number (optional, measurable target)
- targetUnit: string (optional, unit of measurement)
- weekIndex: number (which month, 1-indexed)

Example for "Lose 30 lbs in 6 months":
[{"title":"5 lbs lost","description":"Submit scale photo showing 5 lb loss","targetValue":-5,"targetUnit":"lbs","weekIndex":1},...]`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response");

    const data = JSON.parse(content);
    return Array.isArray(data.milestones) ? data.milestones : data;
  } catch {
    return Array.from({ length: durationMonths }, (_, i) => ({
      title: `Milestone ${i + 1}`,
      description: `Complete milestone ${i + 1} of your goal`,
      weekIndex: i + 1,
    }));
  }
}

export async function generateMotivationalMessage(
  userName: string,
  challengeName: string,
  daysUntilDeadline: number,
  completedMilestones: number,
  totalMilestones: number
): Promise<string> {
  const prompt = `Write a short (2-3 sentences), energetic motivational message for ${userName} who is in a challenge called "${challengeName}".
They have completed ${completedMilestones}/${totalMilestones} milestones and have ${daysUntilDeadline} days until their next deadline.
Make it feel like a high-energy coach. Be specific to their progress. End with an action call.`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });
    return response.choices[0]?.message?.content || "Keep pushing - you've got this!";
  } catch {
    return `Hey ${userName}! You're ${completedMilestones}/${totalMilestones} milestones in. Keep going!`;
  }
}

export async function calculateWinProbability(
  completedMilestones: number,
  totalMilestones: number,
  daysOnTime: number,
  totalDays: number,
  previousChallengesWon: number
): Promise<number> {
  const completionRate = completedMilestones / Math.max(totalMilestones, 1);
  const punctualityRate = daysOnTime / Math.max(totalDays, 1);
  const experienceBonus = Math.min(previousChallengesWon * 0.05, 0.2);
  const base = completionRate * 0.6 + punctualityRate * 0.3 + experienceBonus;
  return Math.max(0, Math.min(100, Math.round(base * 100)));
}
