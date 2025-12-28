"use client";

import { useState } from "react";
import { createInterview } from "@/services/interview";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";

const StartInterview = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);

  const handleStartInterview = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setInterviewId(null);

    try {
      const result = await createInterview();
      setInterviewId(result.data.newInterview.id);
    } catch (error) {
      console.error("Failed to create interview:", error);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (interviewId) {
      router.push(`/attempt-interview/${interviewId}`);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setInterviewId(null);
  };

  return (
    <div className="flex items-center justify-start">
      <Button
        onClick={handleStartInterview}
        className="mt-4 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
      >
        <span className="flex items-center gap-2">Start Interview</span>
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => !isLoading && setIsOpen(open)}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-main" />
              <p className="text-lg font-medium text-gray-700">
                Preparing your interview...
              </p>
              <p className="text-sm text-gray-500">
                Please wait while we set things up
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Ready to Start Interview
                </DialogTitle>
                <DialogDescription className="pt-4 space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 font-medium text-sm">
                      ⚠️ Important Warning
                    </p>
                    <ul className="mt-2 text-sm text-amber-700 space-y-1">
                      <li>• Do not refresh the page during the interview</li>
                      <li>• Do not navigate to another page</li>
                      <li>• Do not close this tab</li>
                    </ul>
                    <p className="mt-3 text-sm text-amber-700">
                      Doing any of the above may result in losing your interview
                      progress.
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:gap-0">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm}>
                  I Understand, Start Interview
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartInterview;
