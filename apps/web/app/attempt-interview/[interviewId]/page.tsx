import AnswerQuestions from "@/components/interview/AnswerQuestions";

const InterviewPage = async ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const { interviewId } = await params;
  return (
    <div className="pt-28  px-4 container mx-auto py-8 max-w-7xl">
      <AnswerQuestions interviewId={interviewId} />
    </div>
  );
};

export default InterviewPage;
