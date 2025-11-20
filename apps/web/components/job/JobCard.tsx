"use client";

import { IJob } from "@/types/job";
import { Trash2, MapPin, Briefcase, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface JobCardProps {
  job: IJob;
  onDelete: (id: string) => void;
}

export const JobCard = ({ job, onDelete }: JobCardProps) => {
  const formatJobType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatSalary = () => {
    if (job.salaryRange?.min && job.salaryRange?.max) {
      return `$${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()}`;
    }
    return "Not specified";
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500s">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {job.jobRole}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(job.id)}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Type & Experience */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 animate-in zoom-in duration-300 delay-75"
          >
            <Briefcase className="h-3 w-3" />
            {formatJobType(job.jobType)}
          </Badge>
          <Badge
            variant="outline"
            className="flex items-center gap-1 animate-in zoom-in duration-300 delay-100"
          >
            <Clock className="h-3 w-3" />
            {job.experience}
          </Badge>
          {job.salaryRange && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 animate-in zoom-in duration-300 delay-150"
            >
              <DollarSign className="h-3 w-3" />
              {formatSalary()}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.jobDescription.length > 100
            ? `${job.jobDescription.slice(0, 100)}...`
            : job.jobDescription}
        </p>

        {/* Technologies */}
        {job.technologies && job.technologies.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Technologies
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.technologies.map((tech, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs hover:bg-primary/20 transition-colors cursor-default"
                  style={{
                    animationDelay: `${200 + idx * 50}ms`,
                  }}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {job.additionalSkills && job.additionalSkills.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {job.additionalSkills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs hover:bg-secondary transition-colors cursor-default"
                  style={{
                    animationDelay: `${300 + idx * 50}ms`,
                  }}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          {/* Posted Date */}
          <p className="text-xs text-muted-foreground ">
            Posted on {new Date(job.createdAt).toLocaleDateString()}
          </p>

          <Link href={`/uploaded-jobs/${job.id}`}>
            <Button>Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
