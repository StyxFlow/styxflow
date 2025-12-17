"use client";

import { useState } from "react";
import { IQuestion } from "@/types/interview";
import { QuestionCard } from "./QuestionCard";
import { FiFilter, FiList } from "react-icons/fi";
import { MdOutlineQuestionAnswer } from "react-icons/md";
import { cn } from "@/lib/utils";

interface QuestionsListProps {
  questions: IQuestion[];
}

type FilterType = "all" | "answered" | "pending";

export const QuestionsList = ({ questions }: QuestionsListProps) => {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredQuestions = questions.filter((q) => {
    if (filter === "answered") return !!q.answerText;
    if (filter === "pending") return !q.answerText;
    return true;
  });

  const answeredCount = questions.filter((q) => q.answerText).length;
  const pendingCount = questions.length - answeredCount;

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: "all", label: "All", count: questions.length },
    { value: "answered", label: "Answered", count: answeredCount },
    { value: "pending", label: "Pending", count: pendingCount },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-main/10 p-2.5">
            <MdOutlineQuestionAnswer className="h-5 w-5 text-main" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-heading">
              Questions & Answers
            </h2>
            <p className="text-sm text-muted-foreground">
              {questions.length} questions in this interview
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                filter === f.value
                  ? "bg-white text-main shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {f.value === "all" && <FiList className="h-4 w-4" />}
              {f.value !== "all" && <FiFilter className="h-4 w-4" />}
              <span>{f.label}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs",
                  filter === f.value
                    ? "bg-main/10 text-main"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <QuestionCard key={question.id} question={question} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-linear-to-br from-white to-cream/30">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
            <FiFilter className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            No questions match this filter
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try selecting a different filter option
          </p>
        </div>
      )}
    </div>
  );
};
