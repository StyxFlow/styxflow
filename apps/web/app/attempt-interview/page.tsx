import { InterviewList } from "@/components/interview/InterviewList";
import StartInterview from "@/components/interview/StartInterview";
import { FetchFailed } from "@/components/shared/FetchFailed";
import { getMyInterviews } from "@/services/interview";
import { RiVoiceAiLine } from "react-icons/ri";

const AttemtInterviewPage = async () => {
  const { data } = await getMyInterviews();
  if (!data) {
    return <FetchFailed />;
  }
  console.log(data);
  const activeInterview = data.find((i) => i.isActive && !i.isCompleted);
  return (
    <div className="pt-20 px-4 container mx-auto py-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg  p-2">
              <RiVoiceAiLine className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Attempt Interview</h1>
          </div>
          <p className="text-muted-foreground">
            Attempt a mock interview to practice your skills and get feedback
          </p>
        </div>
        <div>{activeInterview ? null : <StartInterview />}</div>
      </div>
      {data?.length > 0 ? (
        <InterviewList interviews={data} />
      ) : (
        <p>No interviews available. Start your first interview!</p>
      )}
    </div>
  );
};

export default AttemtInterviewPage;
