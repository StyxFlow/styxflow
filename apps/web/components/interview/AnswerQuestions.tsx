"use client";
import { finishInterviewService } from "@/services/interview";
import { Button } from "../ui/button";
import { MdSettingsVoice as MicrophoneIcon } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import VideoRecorder from "./VideoRecorder";
import { RiChatVoiceAiLine as AIVoiceIcon } from "react-icons/ri";
import { vapi } from "@/lib/vapi-sdk";
import { config } from "@/config";
import { authClient } from "@/lib/auth-client";

const INTERVIEWERS = [
  { id: "Kajal", name: "Alex Thompson", avatar: "👨‍💼", languageCode: "en-IN" },
  { id: "Remi", name: "Remi", avatar: "👩‍💼", languageCode: "fr-FR" },
  {
    id: "Zayd",
    name: "Michael Rodriguez",
    avatar: "👨‍🏫",
    languageCode: "ar-AE",
  },
  { id: "Stephen", name: "Stephen", avatar: "👩‍🔬", languageCode: "en-US" },
  { id: "Aria", name: "Aria", avatar: "👨‍💻", languageCode: "en-NZ" },
  { id: "Ayanda", name: "Ayanda", avatar: "👩‍⚕️", languageCode: "en-ZA" },
];

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
}

const AnswerQuestions = ({ interviewId }: { interviewId: string }) => {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(
    []
  );
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState<{
    id: string;
    name: string;
    avatar: string;
    languageCode: string;
  }>(INTERVIEWERS[0]!);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const { data: user } = authClient.useSession();

  const hasInteracted = useRef(false);
  const isEndedRef = useRef(callStatus === CallStatus.ENDED);

  // Keep ref in sync with state
  useEffect(() => {
    isEndedRef.current = callStatus === CallStatus.ENDED;
  }, [callStatus]);

  // Track user interaction
  useEffect(() => {
    const handleInteraction = () => {
      hasInteracted.current = true;
    };

    // Track any user interaction (click, keypress, etc.)
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  useEffect(() => {
    return () => {
      // Only finish interview if user actually interacted with the page
      if (hasInteracted.current && !isEndedRef.current) {
        (async () => {
          try {
            await finishInterviewService(interviewId);
          } catch (error) {
            console.error("Error finishing interview:", error);
          }
        })();
      }
    };
  }, [interviewId]);

  // const playAudioFromBase64 = (raw: unknown, mimeType = "audio/wav") => {
  //   try {
  //     if (typeof raw !== "string") {
  //       console.error("wavFile is not a string:", raw);
  //       return;
  //     }

  //     // Remove data URL prefix if present
  //     let base64 = raw.trim();
  //     const prefixMatch = base64.match(/^data:audio\/[a-zA-Z0-9.+-]+;base64,/);
  //     if (prefixMatch) {
  //       base64 = base64.slice(prefixMatch[0].length);
  //     }

  //     // Basic sanity: length multiple of 4, pad if needed
  //     const pad = base64.length % 4;
  //     if (pad === 1) {
  //       console.error("Invalid base64 length:", base64.slice(0, 50));
  //       return;
  //     }
  //     if (pad > 0) {
  //       base64 = base64.padEnd(base64.length + (4 - pad), "=");
  //     }

  //     // Debug: first chars
  //     console.log("client base64 sample:", base64.slice(0, 60));

  //     const binary = atob(base64);
  //     const len = binary.length;
  //     const bytes = new Uint8Array(len);
  //     for (let i = 0; i < len; i++) {
  //       bytes[i] = binary.charCodeAt(i);
  //     }

  //     const blob = new Blob([bytes], { type: mimeType });
  //     const url = URL.createObjectURL(blob);
  //     const audio = new Audio(url);
  //     audio.play().catch((err) => console.error("Audio playback failed:", err));
  //   } catch (err) {
  //     console.error("Failed to decode audio base64:", err);
  //   }
  // };

  // const handleConnect = async () => {
  //   setIsLoading(true);
  //   const result = await conductInterview(interviewId, {
  //     userResponse: "Hello, I'm ready to start the interview.",
  //     voiceId: selectedInterviewer.id,
  //     LanguageCode: selectedInterviewer.languageCode,
  //   });

  //   if (result && result.data && result.data.question) {
  //     setIsConnected(true);
  //     console.log(result);
  //     if (result.data.wavFile) {
  //       playAudioFromBase64(
  //         result.data.wavFile as string,
  //         (result.data.mimeType as string) || "audio/mp3"
  //       );
  //       // playAudioFromUrl(result.data.wavFile as string);
  //     }
  //     setMessages([{ from: "ai", text: result.data.question }]);
  //   }
  //   setIsLoading(false);
  // };

  const handleConnect = async () => {
    setCallStatus(CallStatus.CONNECTING);
    vapi.start(config.vapi_workflow_id!, {
      variableValues: {
        username: user?.user.name,
        interviewId: interviewId,
        userId: user?.user.id,
      },
    });
    setCallStatus(CallStatus.ACTIVE);
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.ENDED);
    vapi.stop();
  };

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };
    const onCallFinished = () => {
      setCallStatus(CallStatus.ENDED);
    };
    const onSpeachStart = () => {
      setIsSpeaking(true);
    };
    const onSpeachEnd = () => {
      setIsSpeaking(false);
    };
    const onMessage = (message: {
      type: string;
      transcriptType: string;
      role: string;
      transcript: string;
    }) => {
      if (
        message?.type === "transcript" &&
        message?.transcriptType === "final"
      ) {
        const from = message.role === "assistant" ? "ai" : "user";
        const newMessage = { from, text: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onError = (err: Error) => {
      console.error("VAPI SDK Error", err);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallFinished);
    vapi.on("speech-start", onSpeachStart);
    vapi.on("speech-end", onSpeachEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallFinished);
      vapi.off("speech-start", onSpeachStart);
      vapi.off("speech-end", onSpeachEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {}, [messages, callStatus]);

  const lastMessage = messages[messages.length - 1];
  return (
    <div className="">
      {callStatus === CallStatus.INACTIVE ||
      callStatus === CallStatus.CONNECTING ? (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center animate-in fade-in slide-in-from-top duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Your Interviewer
            </h2>
            <p className="text-muted-foreground">
              Select an interviewer to begin your mock interview
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {INTERVIEWERS.map((interviewer, index) => (
              <button
                key={interviewer.id}
                onClick={() => setSelectedInterviewer(interviewer)}
                className={`p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 ${
                  selectedInterviewer.id === interviewer.id
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-gray-200 hover:border-primary/50"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="text-5xl mb-3">{interviewer.avatar}</div>
                <div className="font-semibold text-gray-900">
                  {interviewer.name}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleConnect}
              disabled={callStatus === CallStatus.CONNECTING}
              size="lg"
              className="px-8 transition-all duration-300 hover:scale-105"
            >
              {callStatus === CallStatus.CONNECTING
                ? "Connecting..."
                : "Connect with Interviewer"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 justify-center">
            <div className=" flex justify-center">
              {!recordedVideoUrl && (
                <div className="grid grid-cols-2 gap-2 ">
                  <div className="h-full bg-main/15 w-auto rounded-2xl flex items-center justify-center">
                    <AIVoiceIcon className="text-4xl text-main" />
                  </div>
                  <VideoRecorder
                    isRecording={callStatus === CallStatus.ACTIVE}
                    onRecordingComplete={setRecordedVideoUrl}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-3 animate-in fade-in slide-in-from-top">
              <div className="text-3xl">{selectedInterviewer.avatar}</div>
              <div>
                <div className="font-semibold text-gray-900">
                  {selectedInterviewer.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  Interview in progress
                </div>
              </div>
            </div>
            <div
              className={`mb-4 p-3 rounded-lg gap-2 flex items-center ${
                lastMessage?.from === "ai"
                  ? "bg-blue-100 text-blue-900 ml-0 mr-auto "
                  : "bg-green-100 text-green-900 mr-0 ml-auto flex-row-reverse"
              } max-w-[80%]`}
            >
              <div
                className={`text-xs font-semibold mb-1 h-10 w-10 flex justify-center items-center rounded-full ${lastMessage?.from === "ai" ? "  bg-green-300" : " bg-sky-600 text-white"}  `}
              >
                {lastMessage?.from === "ai" ? "AI" : "You"}
              </div>
              <div>{lastMessage?.text}</div>
            </div>

            {callStatus === CallStatus.ENDED ? (
              <div className="mt-8 p-6 bg-linear-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Interview Completed! 🎉
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold text-gray-700">
                      Score:
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {score !== null ? `${score}/100` : "N/A"}
                    </div>
                  </div>
                  {feedback && (
                    <div className="mt-4">
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        Feedback:
                      </div>
                      <div className="text-gray-600 leading-relaxed bg-white p-4 rounded-md border border-gray-200">
                        {feedback}
                      </div>
                    </div>
                  )}
                  {recordedVideoUrl && (
                    <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Your Interview Recording
                      </h3>
                      <video
                        src={recordedVideoUrl}
                        controls
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center mt-4">
                <MicrophoneIcon />
                <Button onClick={handleDisconnect}>Disconnect</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerQuestions;
