"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiVoiceAiLine } from "react-icons/ri";
import { FiCalendar, FiCheckCircle, FiClock } from "react-icons/fi";
import { MdOutlineScore } from "react-icons/md";
import { redirect } from "next/navigation";
import { finishInterviewService } from "@/services/interview";
import { IInterview } from "@/types/interview";
import Link from "next/link";

interface InterviewCardProps {
  interview: IInterview;
}

export const InterviewCard = ({ interview }: InterviewCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const redirectToInterviewPage = (id: string) => {
    redirect(`/attempt-interview/${id}`);
  };
  const finishInterview = async (id: string) => {
    const result = await finishInterviewService(id);
    console.log(result);
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
                <Link href={`/attempt/${interview.id}`}>
                  Interview Attempt #{interview.attempt}
                </Link>
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
          <>
            <Button
              onClick={() => redirectToInterviewPage(interview.id)}
              className="w-full group-hover:bg-primary/90 transition-colors"
            >
              Continue Interview
            </Button>
            <Button
              onClick={() => finishInterview(interview.id)}
              className="w-full group-hover:bg-primary/90 transition-colors"
            >
              Finish Interview
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
