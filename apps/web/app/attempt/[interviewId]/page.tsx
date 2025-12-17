import { FetchFailed } from "@/components/shared/FetchFailed";
import { InterviewDetailsView } from "@/components/interview/InterviewDetailsView";
import { getSingleInterview } from "@/services/interview";

const InterviewDetails = async ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const interviewId = (await params).interviewId;
  const { data: interview } = await getSingleInterview(interviewId);

  if (!interview) {
    return <FetchFailed />;
  }

  return <InterviewDetailsView interview={interview} />;
};

export default InterviewDetails;
