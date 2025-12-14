"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SelectRole from "@/components/auth/SelectRole";
import { FieldGroup } from "@/components/ui/field";
import { completeProfile } from "@/services/users";
import { ResumeUpload } from "@/components/auth/ResumeUpload";

const ChooseRolePage = () => {
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER">("CANDIDATE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const organizationName = formData.get("organizationName") as string;
    const organizationRole = formData.get("organizationRole") as string;

    // Validate candidate fields
    if (role === "CANDIDATE" && !resumeFile) {
      setError("Resume is required for candidates");
      setIsLoading(false);
      return;
    }

    // Validate recruiter fields
    if (role === "RECRUITER" && !organizationName) {
      setError("Organization name is required for recruiters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await completeProfile({
        role,
        organizationName,
        organizationRole,
        resume: resumeFile,
      });
      console.log(res);
      if (res?.error) {
        setError(res.message || "Failed to complete profile");
        return;
      }
      // Force a hard navigation to clear the session cache
      // window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error completing profile:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-in slide-in-from-right duration-500 fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to StyxFlow!</CardTitle>
          <CardDescription>
            Please tell us how you&apos;d like to use our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}

              <SelectRole role={role} isLoading={isLoading} setRole={setRole} />

              {/* Resume upload for candidates */}
              {role === "CANDIDATE" && (
                <div className="animate-in slide-in-from-bottom duration-300 fade-in -mt-7">
                  <ResumeUpload
                    onFileSelect={setResumeFile}
                    disabled={isLoading}
                  />
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Setting up your account..." : "Continue"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChooseRolePage;
