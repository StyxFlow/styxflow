"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiVoiceAiLine } from "react-icons/ri";
import { FiCalendar, FiCheckCircle, FiClock } from "react-icons/fi";
import { MdOutlineScore } from "react-icons/md";

interface Interview {
  id: string;
  score: number | null;
  feedback: string | null;
  attempt: number;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string;
}

interface InterviewCardProps {
  interview: Interview;
  onContinue?: (id: string) => void;
}

export const InterviewCard = ({
  interview,
  onContinue,
}: InterviewCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <RiVoiceAiLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                Interview Attempt #{interview.attempt}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <FiCalendar className="h-3.5 w-3.5" />
                {formatDate(interview.createdAt)}
              </div>
            </div>
          </div>

          {interview.isCompleted ? (
            <Badge
              variant="secondary"
              className="animate-in zoom-in duration-300"
            >
              <FiCheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="animate-in zoom-in duration-300"
            >
              <FiClock className="h-3 w-3 mr-1" />
              In Progress
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {interview.score !== null && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <MdOutlineScore className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-lg font-semibold">{interview.score}/100</p>
            </div>
          </div>
        )}

        {interview.feedback && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Feedback
            </p>
            <p className="text-sm line-clamp-2">{interview.feedback}</p>
          </div>
        )}

        {!interview.isCompleted && interview.isActive && (
          <Button
            onClick={() => onContinue?.(interview.id)}
            className="w-full group-hover:bg-primary/90 transition-colors"
          >
            Continue Interview
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
