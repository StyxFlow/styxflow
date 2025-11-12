import { cn } from "@/lib/utils";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SelectRole = ({
  role,
  isLoading,
  setRole,
}: {
  role: "CANDIDATE" | "RECRUITER";
  isLoading: boolean;
  setRole: (role: "CANDIDATE" | "RECRUITER") => void;
}) => {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="role">I want to join as</FieldLabel>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as "CANDIDATE" | "RECRUITER")}
          disabled={isLoading}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CANDIDATE">Candidate (Job Seeker)</SelectItem>
            <SelectItem value="RECRUITER">Recruiter (Employer)</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription className="text-xs">
          Choose whether you&apos;re looking for jobs or hiring candidates.
        </FieldDescription>
      </Field>

      {/* Recruiter-specific fields with smooth transition */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          role === "RECRUITER"
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 ">
            <Field>
              <FieldLabel htmlFor="organizationName">
                Organization Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="organizationName"
                name="organizationName"
                type="text"
                placeholder="Acme Inc."
                required={role === "RECRUITER"}
                disabled={isLoading}
              />
              <FieldDescription className="text-xs">
                The name of your company or organization.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="organizationRole">
                Your Role (Optional)
              </FieldLabel>
              <Input
                id="organizationRole"
                name="organizationRole"
                type="text"
                placeholder="HR Manager, Recruiter, etc."
                disabled={isLoading}
              />
              <FieldDescription className="text-xs">
                Your position within the organization.
              </FieldDescription>
            </Field>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectRole;
