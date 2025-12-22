"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiLoader,
} from "react-icons/fi";
import { IJob } from "@/types/job";
import { getCandidateSuggestions } from "@/services/job";
import { useState } from "react";
import { CandidateList } from "./CandidateList";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { IMatchedCandidate } from "./CandidateCard";

interface JobDetailsProps {
  job: IJob;
}

export const JobDetails = ({ job }: JobDetailsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [candidates, setCandidates] = useState<Array<IMatchedCandidate>>([]);

  const formatSalary = (salary: string) => {
    const num = parseFloat(salary);
    if (num >= 100000) {
      return `${(num / 100000).toFixed(1)}L`;
    }
    return `${(num / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleFindCandidates = async () => {
    setIsLoading(true);
    setShowCandidates(true);
    try {
      const result = await getCandidateSuggestions(job.id);
      console.log(result);
      if (result?.data) {
        setCandidates(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <Card className="overflow-hidden border-t-4 border-t-primary transition-all duration-300 hover:shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-3xl font-bold text-gray-900 transition-colors hover:text-primary">
                {job.jobRole}
              </CardTitle>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 transition-transform hover:scale-105">
                  <FiMapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5 transition-transform hover:scale-105">
                  <FiBriefcase className="h-4 w-4" />
                  <span>{job.jobType}</span>
                </div>
                <div className="flex items-center gap-1.5 transition-transform hover:scale-105">
                  <FiClock className="h-4 w-4" />
                  <span>{job.experience} years</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleFindCandidates}
              size="lg"
              className="transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <FiUsers className="mr-2 h-4 w-4" />
              Find Candidates
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Salary */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 transition-all duration-300 hover:bg-green-100 hover:border-green-300">
            <div className="p-2 bg-green-100 rounded-full transition-transform hover:scale-110">
              <FiDollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salary Range</p>
              <p className="text-xl font-bold text-green-700">
                ${formatSalary(`${job.salaryRange.min}`)} - $
                {formatSalary(`${job.salaryRange.max}`)}
              </p>
            </div>
          </div>

          {/* Posted Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FiCalendar className="h-4 w-4" />
            <span>Posted on {formatDate(job.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Description Card */}
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <p
              className={`text-gray-700 leading-relaxed whitespace-pre-wrap transition-all duration-500 ease-in-out overflow-hidden ${
                isExpanded ? "max-h-none" : "max-h-32"
              }`}
            >
              {job.jobDescription}
            </p>
            {!isExpanded && job.jobDescription.length > 200 && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent pointer-events-none" />
            )}
          </div>
          {job.jobDescription.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 transition-all duration-300 hover:scale-105"
            >
              {isExpanded ? "Show less" : "Read more"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Technologies Card */}
      {job.technologies && job.technologies.length > 0 && (
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Required Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.technologies.map((tech, index) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white animate-in fade-in slide-in-from-bottom-2"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Skills Card */}
      {job.additionalSkills && job.additionalSkills.length > 0 && (
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Additional Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.additionalSkills.map((skill, index) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="px-3 py-1.5 text-sm transition-all duration-300 hover:scale-110 hover:border-primary hover:text-primary animate-in fade-in slide-in-from-bottom-2"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidates Dialog */}
      <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">
              Candidate Recommendations
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse" />
                <FiLoader className="h-16 w-16 text-primary absolute top-0 left-0 animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold animate-pulse">
                  Finding the best candidates...
                </p>
                <p className="text-sm text-muted-foreground animate-in fade-in">
                  Analyzing resumes and matching skills
                </p>
              </div>
            </div>
          ) : (
            <CandidateList candidates={candidates} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
