"use client";

import { CandidateCard, IMatchedCandidate } from "./CandidateCard";
import { FiUsers } from "react-icons/fi";

interface CandidateListProps {
  candidates: IMatchedCandidate[];
}

export const CandidateList = ({ candidates }: CandidateListProps) => {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FiUsers className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No candidates found</h3>
        <p className="text-muted-foreground max-w-sm">
          No matching candidates were found for this job posting. Try adjusting
          the job requirements or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Recommended Candidates
          </h2>
          <p className="text-muted-foreground">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}{" "}
            matched for this position
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {candidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.candidateId}
            candidate={candidate}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
