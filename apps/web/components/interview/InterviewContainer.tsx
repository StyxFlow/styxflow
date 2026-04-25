"use client";

import { Button } from "../ui/button";
import GeminiLiveAssistant from "./GeminiLiveAssistant";
import { useState } from "react";

const InterviewContainer = ({
  interviewId,
  resume,
}: {
  interviewId: string;
  resume: string;
}) => {
  const [token, setToken] = useState<string | null>(null);
  const handleStartInterview = async () => {
    if (!interviewId) {
      console.error("Missing interviewId for access token request");
      return;
    }
    const response = await fetch(`/api/interview/access/${interviewId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, interviewId }),
    });
    if (!response.ok) {
      console.log(await response.json());
      console.error("Failed to get interview access token");
      return;
    }
    const result = await response.json();
    console.log(result);
    if (result?.success) {
      setToken(result.data.token?.name);
    }
  };
  return (
    <div>
      <div>
        <p>Resume</p>
        <p>{resume.slice(0, 200)}</p>
      </div>

      {token ? (
        <GeminiLiveAssistant token={token} />
      ) : (
        <Button onClick={handleStartInterview}>Start Interview</Button>
      )}
    </div>
  );
};

export default InterviewContainer;
