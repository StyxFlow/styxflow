"use client";

import { IInterview } from "@/types/interview";
import { InterviewCard } from "./InterviewCard";
import { RiVoiceAiLine } from "react-icons/ri";

interface InterviewListProps {
  interviews: IInterview[];
}

export const InterviewList = ({ interviews }: InterviewListProps) => {
  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <RiVoiceAiLine className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Start your first AI-powered interview to get personalized feedback and
          improve your skills.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {interviews.map((interview, index) => (
        <div
          key={interview.id}
          className="animate-in fade-in slide-in-from-bottom-4"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: "both",
          }}
        >
          <InterviewCard interview={interview} />
        </div>
      ))}
    </div>
  );
};
