"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import type RecordRTC from "recordrtc";

interface VideoRecorderProps {
  isRecording: boolean;
  onRecordingComplete: (blobUrl: string) => void;
  vapiAudioStream?: MediaStream | null;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  isRecording,
  onRecordingComplete,
  vapiAudioStream,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [RecordRTCLib, setRecordRTCLib] = useState<typeof RecordRTC | null>(
    null
  );

  // Load RecordRTC dynamically on client side only
  useEffect(() => {
    import("recordrtc").then((module) => {
      setRecordRTCLib(() => module.default);
    });
  }, []);

  useEffect(() => {
    if (isRecording && hasPermission && RecordRTCLib) {
      startRecording();
    } else if (!isRecording && hasPermission) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, hasPermission, vapiAudioStream, RecordRTCLib]);

  const startRecording = async () => {
    if (
      !RecordRTCLib ||
      !webcamRef.current ||
      !webcamRef.current.video ||
      !webcamRef.current.video.srcObject
    ) {
      console.log("RecordRTC not loaded or webcam not ready");
      return;
    }

    {
      const webcamStream = webcamRef.current.video.srcObject as MediaStream;

      // If already recording, stop it first to restart with new audio
      if (
        recorderRef.current &&
        recorderRef.current.getState() === "recording"
      ) {
        console.log("Restarting recording with VAPI audio stream");
        recorderRef.current.stopRecording(() => {
          // Destroy old recorder
          recorderRef.current?.destroy();
          recorderRef.current = null;

          // Close old audio context
          if (
            audioContextRef.current &&
            audioContextRef.current.state !== "closed"
          ) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }

          // Start new recording
          setTimeout(() => startRecording(), 100);
        });
        return;
      }

      try {
        // Create audio context for mixing
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const destination = audioContext.createMediaStreamDestination();

        // Get microphone audio from webcam
        const webcamAudioTrack = webcamStream.getAudioTracks()[0];
        if (webcamAudioTrack) {
          const micSource = audioContext.createMediaStreamSource(
            new MediaStream([webcamAudioTrack])
          );
          micSource.connect(destination);
          console.log("Connected microphone audio");
        }

        // Capture VAPI audio
        let capturedVapiAudio = false;
        try {
          // Method 1: Use provided VAPI audio stream
          if (vapiAudioStream) {
            const vapiAudioTracks = vapiAudioStream.getAudioTracks();
            if (vapiAudioTracks.length > 0) {
              const vapiSource =
                audioContext.createMediaStreamSource(vapiAudioStream);
              vapiSource.connect(destination);
              console.log("Connected VAPI audio from stream");
              capturedVapiAudio = true;
            }
          }

          // Method 2: Fallback to getDisplayMedia if VAPI stream not available
          if (!capturedVapiAudio) {
            console.log("VAPI stream not available, requesting tab audio...");
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
              video: false,
              audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                suppressLocalAudioPlayback: false,
              },
              preferCurrentTab: true,
            } as DisplayMediaStreamOptions);

            const systemAudioTrack = displayStream.getAudioTracks()[0];
            if (systemAudioTrack) {
              const systemSource = audioContext.createMediaStreamSource(
                new MediaStream([systemAudioTrack])
              );
              systemSource.connect(destination);
              console.log("Connected tab audio via getDisplayMedia");
              capturedVapiAudio = true;

              // Stop display stream tracks when recording stops
              systemAudioTrack.onended = () => {
                displayStream.getTracks().forEach((track) => track.stop());
              };
            }
          }
        } catch (audioError) {
          console.warn("Could not capture VAPI audio:", audioError);
        }

        if (!capturedVapiAudio) {
          console.warn(
            "Recording without VAPI audio - only microphone will be captured"
          );
        }

        // Create combined stream with video and mixed audio
        const videoTrack = webcamStream.getVideoTracks()[0];
        if (!videoTrack) {
          throw new Error("No video track available");
        }
        const combinedStream = new MediaStream([
          videoTrack,
          ...destination.stream.getAudioTracks(),
        ]);

        recorderRef.current = new RecordRTCLib(combinedStream, {
          type: "video",
          mimeType: "video/webm;codecs=vp9",
          bitsPerSecond: 2500000,
          videoBitsPerSecond: 2000000,
          audioBitsPerSecond: 128000,
          frameRate: 30,
          quality: 0.9,
        });
        recorderRef.current.startRecording();
        console.log("Recording started");
      } catch (error) {
        console.error("Failed to start recording:", error);
        // Fallback to microphone only
        recorderRef.current = new RecordRTCLib(webcamStream, {
          type: "video",
          mimeType: "video/webm",
        });
        recorderRef.current.startRecording();
        console.log("Recording started (microphone only)");
      }
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

        // Clean up audio context
        if (
          audioContextRef.current &&
          audioContextRef.current.state !== "closed"
        ) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
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
