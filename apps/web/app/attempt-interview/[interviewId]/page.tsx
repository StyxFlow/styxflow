import InterviewContainer from "@/components/interview/InterviewContainer";
import { getResumeText } from "@/services/interview-queries";

const InterviewPage = async ({
  params,
}: {
  params: { interviewId: string };
}) => {
  const { interviewId } = await params;
  console.log("from InterviewPage:", interviewId);
  const { data: resume } = await getResumeText();
  return (
    <div className="pt-28  px-4 container mx-auto py-8 max-w-7xl">
      <InterviewContainer
        interviewId={interviewId}
        resume={resume?.resume ?? ""}
      />
    </div>
  );
};

export default InterviewPage;
