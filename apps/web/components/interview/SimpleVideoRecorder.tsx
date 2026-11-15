/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";

interface SimpleVideoRecorderProps {
  isRecording: boolean;
  onRecordingComplete: (blobUrl: string) => void;
  captureSystemAudio?: boolean;
}

const SimpleVideoRecorder = ({
  isRecording,
  onRecordingComplete,
  captureSystemAudio = true,
}: SimpleVideoRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initStream = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!isMounted) return;
        streamRef.current = userStream;
        setStream(userStream);
        setHasPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (error) {
        console.error("Webcam access error:", error);
        setHasPermission(false);
      }
    };

    initStream();

    return () => {
      isMounted = false;
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (displayStreamRef.current) {
        displayStreamRef.current.getTracks().forEach((track) => track.stop());
        displayStreamRef.current = null;
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!hasPermission || !stream) return;

    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, hasPermission, stream]);

  const startRecording = async () => {
    if (!stream) return;
    if (mediaRecorderRef.current?.state === "recording") return;

    chunksRef.current = [];
    const recorderStream = await buildRecordingStream(stream);
    const recorder = new MediaRecorder(recorderStream, {
      mimeType: "video/webm;codecs=vp9",
    });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      onRecordingComplete(url);
    };

    recorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const buildRecordingStream = async (cameraStream: MediaStream) => {
    const videoTrack = cameraStream.getVideoTracks()[0];
    if (!videoTrack) {
      return cameraStream;
    }

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const destination = audioContext.createMediaStreamDestination();

    const micTrack = cameraStream.getAudioTracks()[0];
    if (micTrack) {
      const micSource = audioContext.createMediaStreamSource(
        new MediaStream([micTrack]),
      );
      micSource.connect(destination);
    }

    if (captureSystemAudio) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true, // 👈 THE FIX: This MUST be true to satisfy the browser
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          // This hints to Chrome to show the current tab first
          preferCurrentTab: true,
        } as any);

        displayStreamRef.current = displayStream;

        // 👈 Instantly kill the screen-sharing video track so we only keep the audio
        const unwantedVideoTrack = displayStream.getVideoTracks()[0];
        if (unwantedVideoTrack) {
          unwantedVideoTrack.stop();
        }

        const systemTrack = displayStream.getAudioTracks()[0];
        if (systemTrack) {
          const systemSource = audioContext.createMediaStreamSource(
            new MediaStream([systemTrack]),
          );
          systemSource.connect(destination);

          systemTrack.onended = () => {
            displayStream.getTracks().forEach((track) => track.stop());
          };
        }
      } catch (error) {
        console.warn("System audio capture blocked:", error);
      }
    }

    return new MediaStream([
      videoTrack,
      ...destination.stream.getAudioTracks(),
    ]);
  };

  return (
    <div className="relative w-full max-w-xs rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto"
      />
      {isRecording && (
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-500/80 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full" />
          REC
        </div>
      )}
      {!hasPermission && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm">
          Allow camera access to continue
        </div>
      )}
    </div>
  );
};

export default SimpleVideoRecorder;
