"use client";
import { conductInterview, finishInterviewService } from "@/services/interview";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    return () => {
      (async () => {
        try {
          await finishInterviewService(interviewId);
        } catch (error) {
          console.error("Error finishing interview:", error);
        }
      })();
    };
  }, [interviewId]);

  const handleSubmit = async () => {
    if (!userResponse.trim()) return;

    setIsLoading(true);

    // Add user message to chat
    setMessages((prev) => [...prev, { from: "user", text: userResponse }]);

    const result = await conductInterview(interviewId, { userResponse });

    if (result && result.data && result.data.question) {
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
    </div>
  );
};

export default AnswerQuestions;
