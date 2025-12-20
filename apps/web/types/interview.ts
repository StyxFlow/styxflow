export interface IInterview {
  id: string;
  candidateId: string;
  score: number | null;
  feedback: string | null;
  attempt: number;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  question?: IQuestion[];
}

export interface IQuestion {
  id: string;
  interviewId: string;
  questionText: string;
  answerText: string | null;
  createdAt: string;
  updatedAt: string;
}
