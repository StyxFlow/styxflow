"use client";

import { IJob } from "@/types/job";
import { JobCard } from "./JobCard";
import { Briefcase } from "lucide-react";

interface JobListProps {
  jobs: IJob[];
}

export const JobList = ({ jobs }: JobListProps) => {
  const handleDelete = (id: string) => {
    console.log("Delete job with ID:", id);
    // TODO: Implement delete functionality
  };

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-500">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Briefcase className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          You haven&apos;t posted any job listings yet. Create your first job
          posting to start receiving applications.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job, idx) => (
        <div
          key={job.id}
          style={{
            animationDelay: `${idx * 100}ms`,
          }}
        >
          <JobCard job={job} onDelete={handleDelete} />
        </div>
      ))}
    </div>
  );
};
