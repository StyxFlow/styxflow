"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IInterview } from "@/types/interview";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { RiVoiceAiLine } from "react-icons/ri";
import { useRouter } from "next/navigation";

interface InterviewHeaderProps {
  interview: IInterview;
}

export const InterviewHeader = ({ interview }: InterviewHeaderProps) => {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 group hover:bg-main/10 transition-all duration-300"
      >
        <FiArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
        Back to Interviews
      </Button>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white via-cream/50 to-white border border-main/20 p-8 md:p-10">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cream rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cream  rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="rounded-2xl  p-4 animate-in zoom-in duration-500 delay-100">
              <RiVoiceAiLine className="h-8 w-8 text-main" />
            </div>

            {/* Title & Date */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                Interview Attempt #{interview.attempt}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
                <div className="flex items-center gap-2">
                  <FiCalendar className="h-4 w-4" />
                  <span className="text-sm">
                    {formatDate(interview.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="h-4 w-4" />
                  <span className="text-sm">
                    {formatTime(interview.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="animate-in fade-in zoom-in duration-500 delay-300">
            {interview.isCompleted ? (
              <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm">
                <FiCheckCircle className="h-4 w-4 mr-2" />
                Completed
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-4 py-2 text-sm">
                <FiClock className="h-4 w-4 mr-2" />
                In Progress
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
