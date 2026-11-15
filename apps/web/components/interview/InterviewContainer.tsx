"use client";

import { Button } from "../ui/button";
import GeminiLiveAssistant from "./GeminiLiveAssistant";
import SimpleVideoRecorder from "./SimpleVideoRecorder";
import { useMemo, useState } from "react";

const InterviewContainer = ({
  interviewId,
  resume,
}: {
  interviewId: string;
  resume: string;
}) => {
  const interviewers = useMemo(
    () => [
      {
        id: "kore",
        name: "Kore Green",
        avatar: "https://i.pravatar.cc/120?img=1",
      },
      {
        id: "umbriel",
        name: "Umbriel Lee",
        avatar: "https://i.pravatar.cc/120?img=2",
      },
      {
        id: "zephyr",
        name: "Zephyr",
        avatar: "https://i.pravatar.cc/120?img=3",
      },
      {
        id: "puck",
        name: "Puck",
        avatar: "https://i.pravatar.cc/120?img=4",
      },
      {
        id: "zubenelgenubi",
        name: "Zubenelgenubi",
        avatar: "https://i.pravatar.cc/120?img=5",
      },
      {
        id: "sulafat",
        name: "Sulafat",
        avatar: "https://i.pravatar.cc/120?img=6",
      },
    ],
    [],
  );
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string>(
    interviewers[0]?.id ?? "",
  );
  const [token, setToken] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const handleStartInterview = async () => {
    if (!interviewId) {
      console.error("Missing interviewId for access token request");
      return;
    }
    const response = await fetch(`/api/interview/access/${interviewId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume,
        interviewId,
        voice: selectedInterviewerId,
      }),
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
      setIsRecording(true);
    }
  };

  const handleStopInterview = () => {
    setIsRecording(false);
  };
  return (
    <div>
      <div></div>

      <div className="flex flex-col md:flex-row justify-center items-center md:gap-10 gap-2">
        <p>Select interviewer</p>
        <div className="flex flex-wrap gap-3 my-4  justify-center">
          {interviewers.map((interviewer) => {
            const isSelected = interviewer.id === selectedInterviewerId;
            return (
              <button
                key={interviewer.id}
                type="button"
                onClick={() => {
                  if (!token) {
                    return setSelectedInterviewerId(interviewer.id);
                  }
                }}
                className={`flex items-center gap-3 rounded-md border px-3 py-2 transition ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : !token
                      ? "border-border hover:bg-muted"
                      : "bg-transparent text-gray-500 border-transparent cursor-not-allowed "
                }`}
                aria-pressed={isSelected}
              >
                <span className="text-sm font-medium">{interviewer.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <hr className="border-t my-4 max-w-full md:max-w-4xl mx-auto  border-main/50 w-full" />

      {token ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <GeminiLiveAssistant token={token} autoConnect />
          {!recordedVideoUrl ? (
            <SimpleVideoRecorder
              isRecording={isRecording}
              onRecordingComplete={setRecordedVideoUrl}
            />
          ) : (
            <div className="space-y-4">
              <video
                src={recordedVideoUrl || undefined}
                controls
                className="w-full border-4 shadow-lg border-cream mx-auto mt-2 rounded-lg"
              />
            </div>
          )}
          <div className="lg:col-span-2 flex justify-center">
            <Button onClick={handleStopInterview} variant="outline">
              Stop Recording
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={handleStartInterview} className="flex mx-auto">
          Start Interview
        </Button>
      )}
    </div>
  );
};

export default InterviewContainer;
