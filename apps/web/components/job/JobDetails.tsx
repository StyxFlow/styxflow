"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiUsers,
} from "react-icons/fi";
import { IJob } from "@/types/job";
import { getCandidateSuggestions } from "@/services/job";

interface JobDetailsProps {
  job: IJob;
}

export const JobDetails = ({ job }: JobDetailsProps) => {
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
    const result = await getCandidateSuggestions(job.id);
    console.log(result);
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
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {job.jobDescription}
          </p>
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
    </div>
  );
};
