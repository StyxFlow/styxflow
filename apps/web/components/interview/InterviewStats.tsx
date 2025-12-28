"use client";

import { IInterview } from "@/types/interview";
import { MdOutlineScore, MdOutlineQuestionAnswer } from "react-icons/md";
import { FiMessageSquare, FiActivity, FiAward } from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi";

interface InterviewStatsProps {
  interview: IInterview;
}

export const InterviewStats = ({ interview }: InterviewStatsProps) => {
  const totalQuestions = interview.question?.length || 0;
  const answeredQuestions =
    interview.question?.filter((q) => q.answerText)?.length || 0;
  const completionRate =
    totalQuestions > 0
      ? Math.round((answeredQuestions / totalQuestions) * 100)
      : 0;

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreGradient = (score: number | null) => {
    if (score === null) return "from-gray-100 to-gray-50";
    if (score >= 80) return "from-green-50 to-emerald-50";
    if (score >= 60) return "from-amber-50 to-yellow-50";
    return "from-red-50 to-orange-50";
  };

  const stats = [
    {
      icon: <MdOutlineScore className="h-6 w-6" />,
      label: "Score",
      value: interview.score !== null ? `${interview.score}/100` : "Pending",
      color: getScoreColor(interview.score),
      gradient: getScoreGradient(interview.score),
      delay: "delay-100",
    },
    {
      icon: <MdOutlineQuestionAnswer className="h-6 w-6" />,
      label: "Total Questions",
      value: totalQuestions.toString(),
      color: "text-main",
      gradient: "from-main/10 to-main/5",
      delay: "delay-150",
    },
    {
      icon: <FiMessageSquare className="h-6 w-6" />,
      label: "Answered",
      value: `${answeredQuestions}/${totalQuestions}`,
      color: "text-blue-600",
      gradient: "from-blue-50 to-sky-50",
      delay: "delay-200",
    },
    {
      icon: <FiActivity className="h-6 w-6" />,
      label: "Completion",
      value: `${completionRate}%`,
      color: "text-purple-600",
      gradient: "from-purple-50 to-violet-50",
      delay: "delay-250",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden rounded-2xl bg-linear-to-br ${stat.gradient}
              border border-gray-100 p-5 
              hover:shadow-lg hover:-translate-y-1 
              transition-all duration-300 
              animate-in fade-in slide-in-from-bottom-4 ${stat.delay}
            `}
          >
            {/* Background decoration */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/50 rounded-full blur-xl" />

            <div className="relative z-10">
              <div className={`${stat.color} mb-3`}>{stat.icon}</div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Section */}
      {interview.feedback && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="rounded-2xl bg-linear-to-br from-cream/80 to-white border border-main/10 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="rounded-xl p-3 shrink-0 md:block hidden">
                <HiOutlineLightBulb className="text-4xl text-main" />
              </div>
              <div className="space-y-2">
                <div className="flex  items-center flex-row  gap-2">
                  <h3 className="font-semibold text-gray-900">AI Feedback</h3>
                  <FiAward className="h-4 w-4 text-main" />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {interview.feedback}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
