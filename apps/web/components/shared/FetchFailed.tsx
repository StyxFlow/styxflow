import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FetchFailedProps {
  message?: string;
  title?: string;
}

export const FetchFailed = ({
  message = "Failed to load data. Please try again later.",
  title = "Error",
}: FetchFailedProps) => {
  return (
    <div className="flex items-center justify-center py-16 animate-in fade-in zoom-in duration-500">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};
