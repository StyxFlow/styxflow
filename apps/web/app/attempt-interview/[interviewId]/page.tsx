import AnswerQuestions from "@/components/interview/AnswerQuestions";
import { FetchFailed } from "@/components/shared/FetchFailed";
import { conductInterview } from "@/services/interview";

const InterviewPage = async ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const { interviewId } = await params;
  const data = await conductInterview(interviewId);
  if (!data || !data.data || !data.data.question) {
    return <FetchFailed message="Failed to start the interview" title="OOPS" />;
  }
  console.log(data);
  return (
    <div className="pt-24  px-4 container mx-auto py-8 max-w-7xl">
      <AnswerQuestions
        introMessage={data.data.question}
        interviewId={interviewId}
      />
    </div>
  );
};

export default InterviewPage;
