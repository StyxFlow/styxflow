"use client";
import { conductInterview } from "@/services/interview";
import { Button } from "../ui/button";
import { useState } from "react";

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
  const handleSubmit = async () => {
    const result = await conductInterview(interviewId);
    if (result && result.data && result.data.question) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: result.data.question },
      ]);
    }
    console.log(result);
  };
  return (
    <div className="">
      <div>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded-lg flex items-center ${
              message.from === "ai"
                ? "bg-blue-100 text-blue-900 ml-0 mr-auto "
                : "bg-green-100 text-green-900 mr-0 ml-auto flex-row-reverse"
            } max-w-[80%]`}
          >
            <div
              className={`text-xs font-semibold mb-1 h-10 w-10 flex justify-center items-center rounded-full ${message.from === "ai" ? "ml-0 mr-2  bg-green-300" : "mr-0 ml-2 bg-sky-600 text-white"}  `}
            >
              {message.from === "ai" ? "AI" : "You"}
            </div>
            <div>{message.text}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Button onClick={handleSubmit}>Submit Answer</Button>
      </div>
    </div>
  );
};

export default AnswerQuestions;
