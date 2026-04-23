"use client";

import { getInterviewAccessToken } from "@/services/interview";
import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
} from "@livekit/components-react";
import { useRoomContext } from "@livekit/components-react";
import { config } from "@/config";

const RealtimeInterview = ({ interviewId }: { interviewId: string }) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      if (!interviewId) return;
      const token = await getInterviewAccessToken(interviewId);
      console.log(token);
      setToken(token.data.token);
    };
    fetchToken();
  }, [interviewId]);
  if (token === "") {
    return <div>Preparing your interview environment...</div>;
  }
  return (
    <div>
      url--{config.livekit.url!}
      <LiveKitRoom
        video={false} // Audio only for the interview!
        audio={true}
        token={token}
        serverUrl={config.livekit.url!}
        connect={true}
        // This is crucial: it automatically asks for mic permissions
        data-lk-theme="default"
      >
        {/* This invisible component plays the AI's audio back to the user */}
        <RoomAudioRenderer />

        {/* Optional UI component to show the connection status */}
        <div className="flex flex-col items-center justify-center p-10">
          <h2 className="text-2xl font-bold mb-4">Interview in Progress</h2>
          <VoiceAssistantControl />
        </div>
      </LiveKitRoom>
      <div>aaa..........</div>
    </div>
  );
};

function VoiceAssistantControl() {
  const { state } = useVoiceAssistant();
  const roomContext = useRoomContext();
  // state can be 'disconnected', 'initializing', 'listening', 'speaking'

  const handleDisconnect = () => {
    roomContext?.disconnect();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-lg">
        AI Status: <span className="font-semibold text-blue-500">{state}</span>
      </div>
      <button
        onClick={handleDisconnect}
        className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}

export default RealtimeInterview;
