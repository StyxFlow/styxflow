import { FetchFailed } from "@/components/shared/FetchFailed";
import { JobDetails } from "@/components/job/JobDetails";
import { getASingleJob } from "@/services/job";

const JobDetailsPage = async ({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) => {
  const { jobId } = await params;
  const { data: job } = await getASingleJob(jobId);
  if (!job) {
    return <FetchFailed />;
  }

  return (
    <div className="pt-20 px-4 container mx-auto py-8 max-w-5xl">
      <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
        <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Job Details
        </h1>
        <p className="text-muted-foreground">
          View complete information about this job posting
        </p>
      </div>
      <JobDetails job={job} />
    </div>
  );
};

export default JobDetailsPage;
