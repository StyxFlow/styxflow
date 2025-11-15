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
}
