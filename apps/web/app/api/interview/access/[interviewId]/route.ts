import { config } from "@/config";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: { interviewId: string } },
) {
  const body = await _request.json();
  const interviewId = (await params?.interviewId) ?? body?.interviewId;
  if (!interviewId) {
    return NextResponse.json(
      { success: false, message: "Missing interviewId" },
      { status: 400 },
    );
  }
  const token = (await cookies()).get(config.better_auth_key!)?.value;
  const response = await fetch(
    `${config.server_url}/interview/interview-access/${interviewId}`,
    {
      method: "POST",
      headers: {
        authorization: token ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
