"use client";

import { FiMessageSquare, FiPlay } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EmptyQuestionsProps {
  isCompleted: boolean;
}

export const EmptyQuestions = ({ isCompleted }: EmptyQuestionsProps) => {
  const router = useRouter();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
      <div className="text-center py-20 rounded-3xl border border-dashed border-main/20 bg-linear-to-br from-white to-cream/50">
        {/* Animated Icon */}
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 rounded-3xl bg-main/10 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-linear-to-br from-main/20 to-main/10 flex items-center justify-center">
            <FiMessageSquare className="h-12 w-12 text-main" />
          </div>
        </div>

        {/* Text Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">
          {isCompleted ? "No Questions Recorded" : "Interview Not Started"}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {isCompleted
            ? "This interview was completed but no questions were recorded."
            : "Start the interview to see questions and record your answers."}
        </p>

        {/* CTA Button */}
        {!isCompleted && (
          <Button
            onClick={() => router.back()}
            className="bg-main hover:bg-main/90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <FiPlay className="h-4 w-4 mr-2" />
            Start Interview
          </Button>
        )}
      </div>
    </div>
  );
};
