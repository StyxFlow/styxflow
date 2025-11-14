import { getMyUploadedJobs } from "@/services/job";
import { JobList } from "@/components/job/JobList";
import { Briefcase } from "lucide-react";

const UploadedJobsPage = async () => {
  const { data } = await getMyUploadedJobs();

  return (
    <div className="container mx-auto pt-20 px-4 py-8 max-w-7xl">
      <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">My Job Postings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and track all your job listings in one place
        </p>
      </div>

      <JobList jobs={data || []} />
    </div>
  );
};

export default UploadedJobsPage;
