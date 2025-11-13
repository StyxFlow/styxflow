export type TjobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";

export interface IJob {
  id: string;
  jobRole: string;
  jobDescription: string;
  jobExperience: string;
  jobType: TjobType;
  location: string;
  technologies: string[];
  additionalSkills: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  recruiterId: string;
  created_at: string;
  updated_at: string;
}
