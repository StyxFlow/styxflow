"use client";
import { conductInterview, finishInterviewService } from "@/services/interview";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";

const AnswerQuestions = ({
  interviewId,
  introMessage,
}: {
  interviewId: string;
  introMessage: string;
}) => {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([
    { from: "ai", text: introMessage },
  ]);
  const [userResponse, setUserResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const hasInteracted = useRef(false);
  const isEndedRef = useRef(isEnded);

  // Keep ref in sync with state
  useEffect(() => {
    isEndedRef.current = isEnded;
  }, [isEnded]);

  // Track user interaction
  useEffect(() => {
    const handleInteraction = () => {
      hasInteracted.current = true;
    };

    // Track any user interaction (click, keypress, etc.)
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  useEffect(() => {
    return () => {
      // Only finish interview if user actually interacted with the page
      if (hasInteracted.current && !isEndedRef.current) {
        (async () => {
          try {
            await finishInterviewService(interviewId);
          } catch (error) {
            console.error("Error finishing interview:", error);
          }
        })();
      }
    };
  }, [interviewId]);

  const handleSubmit = async () => {
    if (!userResponse.trim()) return;

    setIsLoading(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { from: "user", text: userResponse }]);

    const result = await conductInterview(interviewId, { userResponse });
    console.log(result);

    if (result && result.data && result.data.question) {
      if (result.data.interview) {
        if (result.data.interview.isCompleted === true) {
          setIsEnded(true);
          setScore(result.data.interview.score);
          setFeedback(result.data.interview.feedback);
        }
      }
      if (result.data.wavFile) {
        const audioBytes = Uint8Array.from(atob(result.data.wavFile), (c) =>
          c.charCodeAt(0)
        );
        const blob = new Blob([audioBytes], { type: result.data.mimeType });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play().catch((err) => console.log("Audio playback failed:", err));
      }
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: result.data.question },
      ]);
    }

    setUserResponse("");
    setIsLoading(false);
  };
  return (
    <div className="">
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded-lg gap-2 flex items-center ${
              message.from === "ai"
                ? "bg-blue-100 text-blue-900 ml-0 mr-auto "
                : "bg-green-100 text-green-900 mr-0 ml-auto flex-row-reverse"
            } max-w-[80%]`}
          >
            <div
              className={`text-xs font-semibold mb-1 h-10 w-10 flex justify-center items-center rounded-full ${message.from === "ai" ? "  bg-green-300" : " bg-sky-600 text-white"}  `}
            >
              {message.from === "ai" ? "AI" : "You"}
            </div>
            <div>{message.text}</div>
          </div>
        ))}
      </div>
      {isEnded ? (
        <div className="mt-8 p-6 bg-linear-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Interview Completed! 🎉
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-gray-700">Score:</div>
              <div className="text-3xl font-bold text-blue-600">
                {score !== null ? `${score}/100` : "N/A"}
              </div>
            </div>
            {feedback && (
              <div className="mt-4">
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  Feedback:
                </div>
                <div className="text-gray-600 leading-relaxed bg-white p-4 rounded-md border border-gray-200">
                  {feedback}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2 mt-4">
          <Input
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="Type your answer..."
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !userResponse.trim()}
          >
            {isLoading ? "Sending..." : "Submit Answer"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnswerQuestions;
