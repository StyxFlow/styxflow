import { FetchFailed } from "@/components/shared/FetchFailed";
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
  return <div className="pt-24"></div>;
};

export default InterviewDetails;
