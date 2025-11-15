"use client";

import { startInterview } from "@/services/interview";
import { Button } from "../ui/button";

const StartInterview = () => {
  const handleStartInterview = async () => {
    const result = await startInterview();
    console.log(result);
  };

  return (
    <div className="flex items-center justify-start">
      <Button
        onClick={handleStartInterview}
        className="mt-4 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
      >
        <span className="flex items-center gap-2">Start Interview</span>
      </Button>
    </div>
  );
};

export default StartInterview;
