import AnswerQuestions from "@/components/interview/AnswerQuestions";
import { getResumeText } from "@/services/interview";

const InterviewPage = async ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const { interviewId } = await params;
  const {data:resume} = await getResumeText(); 
  
  return (
    <div className="pt-28  px-4 container mx-auto py-8 max-w-7xl">
      <AnswerQuestions interviewId={interviewId}  resume={resume.resume} />
    </div>
  );
};

export default InterviewPage;
