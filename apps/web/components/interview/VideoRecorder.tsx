"use client";

import { endInterviewCall } from "@/services/interview";
import { InterviewMessage } from "@/types/interview";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import type RecordRTC from "recordrtc";

interface VideoRecorderProps {
  isRecording: boolean;
  onRecordingComplete: (blobUrl: string) => void;
  vapiAudioStream?: MediaStream | null;
  setScore: (score: number) => void;
  setFeedback: (feedback: string) => void;
  interviewId: string;
  setUploading: (uploading: boolean) => void;
  setProgress: (progress: number) => void;
  messages: InterviewMessage[];
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  isRecording,
  onRecordingComplete,
  vapiAudioStream,
  setScore,
  setFeedback,
  interviewId,
  setUploading,
  setProgress,
  messages,
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
          videoBitsPerSecond: 500000,
          audioBitsPerSecond: 128000,
          frameRate: 30,
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
      recorderRef.current.stopRecording(async () => {
        const blob = recorderRef.current!.getBlob();
        console.log("Recording stopped");
        const url = URL.createObjectURL(blob);
        onRecordingComplete(url);
        const videoFile = new File([blob], `interview_${interviewId}.webm`, {
          type: "video/webm",
        });
        console.log("Video file size  -->", videoFile.size);
        let transcript = "";
        messages.forEach((element) => {
          if (element.from === "user") {
            transcript += `Candidate: ${element.text}\n`;
          } else if (element.from === "ai") {
            transcript += `Interviewer: ${element.text}\n`;
          }
        });
        const result = await endInterviewCall(
          {
            transcript,
          },
          interviewId
        );
        console.log(result);
        if (result?.data) {
          setScore(result.data.score);
          setFeedback(result.data.feedback);
          // uploading video file
          setUploading(true);
          const signRes = await fetch("/api/sign-cloudinary");
          const { signature, timestamp, apiKey, cloudName } =
            await signRes.json();
          const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
          const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB
          const totalChunks = Math.ceil(videoFile.size / CHUNK_SIZE);
          const uniqueUploadId = `uqid_${Date.now()}`;
          for (
            let currentChunk = 0;
            currentChunk < totalChunks;
            currentChunk++
          ) {
            // Calculate start and end bytes
            const start = currentChunk * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, videoFile.size);

            // SLICE THE FILE
            const chunk = videoFile.slice(start, end);

            // Prepare Data
            const formData = new FormData();
            formData.append("file", chunk);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            formData.append("folder", "user_uploads"); // Must match backend params
            formData.append("cloud_name", cloudName);

            // CRITICAL HEADERS for Chunking
            // Format: "bytes start-end/total_file_size"
            // Example: "bytes 0-6291455/50000000"
            const contentRange = `bytes ${start}-${end - 1}/${videoFile.size}`;

            try {
              console.log("uploading chunk -->", chunk);
              const response = await fetch(url, {
                method: "POST",
                headers: {
                  "X-Unique-Upload-Id": uniqueUploadId, // The Session Key
                  "Content-Range": contentRange,
                },
                body: formData,
              });

              if (!response.ok) throw new Error("Chunk upload failed");
              console.log("chunk uploaded");
              // Update Progress Bar
              const percentage = Math.round(
                ((currentChunk + 1) / totalChunks) * 100
              );
              setProgress(percentage);

              // Log final response on last chunk
              if (currentChunk === totalChunks - 1) {
                const result = await response.json();
                console.log("Upload Complete! Video URL:", result.secure_url);
                alert("Upload Finished!");
              }
            } catch (error) {
              console.error("Error uploading chunk:", error);
              setUploading(false);
              return; // Stop the loop on error
            }
          }
          setUploading(false);
        }
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
