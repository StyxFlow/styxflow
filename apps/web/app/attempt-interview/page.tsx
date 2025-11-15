import StartInterview from "@/components/interview/StartInterview";
import { RiVoiceAiLine } from "react-icons/ri";

const AttemtInterviewPage = () => {
  return (
    <div className="pt-20 px-4 container mx-auto py-8 max-w-7xl">
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
      <StartInterview />
    </div>
  );
};

export default AttemtInterviewPage;
