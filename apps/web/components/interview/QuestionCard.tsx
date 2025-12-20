"use client";

import { useState } from "react";
import { IQuestion } from "@/types/interview";
import { FiChevronDown, FiUser, FiMessageCircle } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: IQuestion;
  index: number;
}

export const QuestionCard = ({ question, index }: QuestionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAnswer = !!question.answerText;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "group rounded-2xl border transition-all duration-500 overflow-hidden",
        "animate-in fade-in slide-in-from-bottom-4",
        isExpanded
          ? "bg-white shadow-lg border-main/30"
          : "bg-linear-to-br from-white to-cream/30 border-gray-100 hover:border-main/20 hover:shadow-md"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-5 md:p-6 focus:outline-none focus:ring-2 focus:ring-main/20 focus:ring-inset rounded-2xl"
      >
        <div className="flex items-start gap-4">
          {/* Question Number */}
          <div
            className={cn(
              "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300",
              isExpanded
                ? "bg-main text-white scale-110"
                : "bg-main/10 text-main group-hover:bg-main/20"
            )}
          >
            {index + 1}
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RiRobot2Line className="h-3.5 w-3.5 text-main" />
                <span>AI Interviewer</span>
                <span className="text-gray-300">•</span>
                <span>{formatDate(question.createdAt)}</span>
              </div>

              {/* Status indicator */}
              <div
                className={cn(
                  "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300",
                  hasAnswer
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {hasAnswer ? "Answered" : "Pending"}
              </div>
            </div>

            {/* Question Text */}
            <p
              className={cn(
                "text-gray-900 font-medium leading-relaxed transition-all duration-300",
                !isExpanded && "line-clamp-2"
              )}
            >
              {question.questionText}
            </p>
          </div>

          {/* Expand Icon */}
          <div
            className={cn(
              "shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300",
              isExpanded ? "rotate-180 bg-main/10" : "group-hover:bg-main/10"
            )}
          >
            <FiChevronDown
              className={cn(
                "h-4 w-4 transition-colors duration-300",
                isExpanded ? "text-main" : "text-gray-400 group-hover:text-main"
              )}
            />
          </div>
        </div>
      </button>

      {/* Expanded Content - Answer */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-5 md:px-6 pb-5 md:pb-6">
          <div className="border-t border-gray-100 pt-5">
            {hasAnswer ? (
              <div className="flex gap-4">
                {/* User Avatar */}
                <div className="shrink-0 w-10 h-10 rounded-xl bg-linear-to-br from-main/20 to-main/10 flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-main" />
                </div>

                {/* Answer Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-gray-700">
                      Your Answer
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{formatDate(question.updatedAt)}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-linear-to-br from-cream/50 to-cream/30 border border-cream">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {question.answerText}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-6 text-muted-foreground">
                <FiMessageCircle className="h-5 w-5" />
                <p className="text-sm">No answer provided yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
