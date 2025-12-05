"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import RecordRTC from "recordrtc";

interface VideoRecorderProps {
  isRecording: boolean;
  onRecordingComplete: (blobUrl: string) => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  isRecording,
  onRecordingComplete,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check for permissions or handle permission errors if needed
    // react-webcam handles requesting permissions automatically on mount
  }, []);

  useEffect(() => {
    if (isRecording && hasPermission) {
      startRecording();
    } else if (!isRecording && hasPermission) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, hasPermission]);

  const startRecording = () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.srcObject
    ) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      // Check if already recording to avoid double start
      if (
        recorderRef.current &&
        recorderRef.current.getState() === "recording"
      ) {
        return;
      }

      recorderRef.current = new RecordRTC(stream, {
        type: "video",
        mimeType: "video/webm",
      });
      recorderRef.current.startRecording();
      console.log("Recording started");
    } else {
      console.log("Webcam stream not ready yet");
    }
  };

  const stopRecording = () => {
    console.log("Recording stopping");
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current!.getBlob();
        console.log("Recording stopped");
        const url = URL.createObjectURL(blob);
        onRecordingComplete(url);
      });
    }
  };

  return (
    <div className="relative w-full max-w-xs rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-black">
      <Webcam
        audio={true}
        muted={true}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full h-auto"
        onUserMedia={() => setHasPermission(true)}
        onUserMediaError={(err) => console.error("Webcam error:", err)}
      />
      {isRecording && (
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-500/80 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full" />
          REC
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
