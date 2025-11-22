"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FiMail, FiStar, FiTrendingUp } from "react-icons/fi";
import { IUser } from "@/types/user";
import { IInterview } from "@/types/interview";

export interface IMatchedCandidate {
  candidateId: string;
  avgScore: number;
  sumScore: number;
  topChunks: { text: string; score: number }[];
  candidate: IUser;
  interview: IInterview;
}

interface CandidateCardProps {
  candidate: IMatchedCandidate;
  index: number;
}

export const CandidateCard = ({ candidate, index }: CandidateCardProps) => {
  const scorePercentage = Math.round(candidate.avgScore * 100);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-blue-600";
    if (score >= 0.4) return "text-yellow-600";
    return "text-orange-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return "bg-green-50 border-green-200";
    if (score >= 0.6) return "bg-blue-50 border-blue-200";
    if (score >= 0.4) return "bg-yellow-50 border-yellow-200";
    return "bg-orange-50 border-orange-200";
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "both",
      }}
    >
      <CardHeader className="pb-3">
        <div className="gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg transition-transform group-hover:scale-110">
              #{index + 1}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white"
            >
              <FiMail className="mr-2 h-4 w-4" />
              Contact
            </Button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {candidate.candidate.name}
              </h3>
              <p className=" text-xs text-gray-600">
                {candidate.interview.attempt} Attempts
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              email: {candidate.candidate.email}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${getScoreBgColor(candidate.avgScore)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <FiStar
                className={`h-4 w-4 ${getScoreColor(candidate.avgScore)}`}
              />
              <p className="text-xs font-medium text-muted-foreground">
                Total Match
              </p>
            </div>
            <p
              className={`text-2xl font-bold ${getScoreColor(candidate.avgScore)}`}
            >
              {scorePercentage}%
            </p>
          </div>

          <div
            className={`p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${getScoreBgColor((candidate.interview.score || 0) / 100)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <FiTrendingUp
                className={`h-4 w-4 ${getScoreColor((candidate.interview.score || 0) / 100)}`}
              />
              <p className="text-xs font-medium text-muted-foreground">
                Interview Score
              </p>
            </div>
            <p
              className={`text-2xl font-bold ${getScoreColor((candidate.interview.score || 0) / 100)}`}
            >
              {candidate.interview.score}%
            </p>
          </div>
        </div>

        {/* Matched Chunks */}
        {/* {candidate.topChunks && candidate.topChunks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Top Matched Excerpts:
            </p>
            <div className="space-y-2">
              {candidate.topChunks.slice(0, 2).map((chunk, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 rounded-md border border-gray-200 transition-all duration-300 hover:bg-gray-100 hover:border-gray-300 animate-in fade-in slide-in-from-left"
                  style={{
                    animationDelay: `${index * 100 + idx * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant="secondary"
                      className="text-xs transition-transform hover:scale-105"
                    >
                      Match {idx + 1}
                    </Badge>
                    <span className="text-xs font-medium text-gray-600">
                      {Math.round(chunk.score * 100)}% relevance
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
};
