"use client";

import { startInterview } from "@/services/interview";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const StartInterview = () => {
  const router = useRouter();
  const handleStartInterview = async () => {
    const result = await startInterview();
    console.log(`/attempt-interview/${result.data.newInterview.id}`);
    // console.log(result);
    router.push(`/attempt-interview/${result.data.newInterview.id}`);
    // window.location.href = `/attempt-interview/${result.data.newInterview.id}`;
    console.log("pushed");
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
