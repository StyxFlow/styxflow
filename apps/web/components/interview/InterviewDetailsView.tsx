"use client";

import { IInterview } from "@/types/interview";
import { InterviewHeader } from "./InterviewHeader";
import { InterviewStats } from "./InterviewStats";
import { QuestionsList } from "./QuestionsList";
import { EmptyQuestions } from "./EmptyQuestions";
import VideoPlayer from "./VideoPlayer";

interface InterviewDetailsViewProps {
  interview: IInterview;
}

export const InterviewDetailsView = ({
  interview,
}: InterviewDetailsViewProps) => {
  const hasQuestions = interview.question && interview.question.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-cream/20 to-cream/40">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-main/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-cream rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-main/3 rounded-full blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-28 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <InterviewHeader interview={interview} />

          {/* Stats Section */}
          <InterviewStats interview={interview} />

          {/* Interview Recording */}
          <div className="">
            <h2 className="font-heading text-xl text-center mb-4">
              Interview Recording
            </h2>
            {interview.recordingUrl ? (
              <VideoPlayer
                publicId={
                  interview.recordingUrl?.split("upload/")[1]?.split(".")[0] ||
                  ""
                }
              />
            ) : (
              <p className="text-center text-gray-500">
                No recording available.
              </p>
            )}
          </div>

          {/* Questions Section */}
          {hasQuestions ? (
            <QuestionsList questions={interview.question!} />
          ) : (
            <EmptyQuestions isCompleted={interview.isCompleted} />
          )}
        </div>
      </div>
    </div>
  );
};
