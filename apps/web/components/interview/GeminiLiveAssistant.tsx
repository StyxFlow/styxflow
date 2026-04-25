/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { Input } from "../ui/input";

const GeminiLiveAssistant = ({ token }: { token: string }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [status, setStatus] = useState("Idle");
  const [userInput, setUserInput] = useState("");

  // Move the connection logic OUT of useEffect and into a click handler
  const connectToGemini = () => {
    if (!token) {
      console.error("No token available");
      return;
    }

    setStatus("Connecting...");

    // 1. Initialize Web Audio API
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContext({ sampleRate: 24000 });

    // 2. Open the WebSocket
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("Connected");
      console.log("WebSocket connection opened");

      // Optional: Send an initial hello automatically once connected
      // sendTextMessage("Hello, the interview has started.");
      const setupMessage = {
        setup: {
          // Make sure this matches the model you set in your backend token generator!
          model: "gemini-3.1-flash-live-preview",
          generationConfig: {
            responseModalities: ["AUDIO"],
          },
        },
      };

      ws.send(JSON.stringify(setupMessage));
    };

    ws.onclose = (event) => {
      console.log(`Disconnected. Code: ${event.code}, Reason: ${event.reason}`);
      setStatus("Disconnected");
    };
    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
      setStatus("Error");
    };

    // 3. Listen for Gemini's responses
    ws.onmessage = async (event) => {
      console.log(event);
      try {
        // 1. Check if the data is a Blob, and convert it to text if it is
        let rawData = event.data;
        if (rawData instanceof Blob) {
          rawData = await rawData.text();
        }

        // 2. Now it is safe to parse
        const response = JSON.parse(rawData);
        console.log(response);

        if (response.setupComplete) {
          console.log("Setup confirmed by Google. Waking up the AI...");

          const initialPrompt =
            "Hello! The interview environment is now ready. Please briefly introduce yourself to the candidate and ask your first technical question.";
          sendTextMessage(initialPrompt);
        }

        // ... the rest of your audio handling logic stays exactly the same
        if (response.serverContent?.modelTurn) {
          const parts = response.serverContent.modelTurn.parts;
          for (const part of parts) {
            if (part.inlineData?.data) {
              playGeminiAudio(part.inlineData.data);
            }
          }
        }

        if (response.serverContent?.outputTranscription) {
          console.log(
            "Gemini:",
            response.serverContent.outputTranscription.text,
          );
        }
      } catch (error) {
        console.error("Error parsing message from Gemini:", error);
      }
    };
  };
  const playGeminiAudio = async (base64Audio: string) => {
    if (!audioCtxRef.current) return;

    // Wake up the context if it's sleeping
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    // 1. Decode Base64 string to an ArrayBuffer
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. Convert 16-bit PCM (Int16) to Float32
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i]! / 32768.0;
    }

    // 3. Create the AudioBuffer
    const audioBuffer = audioCtxRef.current.createBuffer(
      1,
      float32Array.length,
      24000,
    );
    audioBuffer.getChannelData(0).set(float32Array);

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtxRef.current.destination);

    // 4. THE MAGIC QUEUE: Schedule the playback
    const currentTime = audioCtxRef.current.currentTime;

    // If the next play time is in the past, reset it to right now
    if (nextPlayTimeRef.current < currentTime) {
      nextPlayTimeRef.current = currentTime;
    }

    // Tell this specific chunk of audio to start at the scheduled time
    source.start(nextPlayTimeRef.current);

    // Advance the schedule tracker by the length of this audio chunk
    nextPlayTimeRef.current += audioBuffer.duration;
  };
  const sendTextMessage = (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("Cannot send: WebSocket is not open");
      return;
    }

    // The EXACT format required by the Gemini Live WebSockets
    const message = {
      realtimeInput: {
        text: text,
      },
    };

    console.log("Sending to Gemini:", JSON.stringify(message, null, 2));

    wsRef.current.send(JSON.stringify(message));
  };

  // Safe manual disconnect
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (audioCtxRef.current?.state !== "closed") {
      audioCtxRef.current?.close();
    }
    setStatus("Disconnected");
    if (isMicOn) {
      stopMicrophone();
    }
  };

  const startMicrophone = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected!");
      return;
    }

    try {
      // 1. Request mic access with Echo Cancellation turned ON
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Request 16kHz from the hardware
        },
      });

      micStreamRef.current = stream;

      // 2. Create a dedicated AudioContext for the microphone
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      micAudioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      // 3. Create a processor to grab audio chunks (4096 samples at a time)
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        // Stop processing if WebSocket closes
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
          return;

        const float32Data = e.inputBuffer.getChannelData(0);

        // 4. Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
        const int16Data = new Int16Array(float32Data.length);
        for (let i = 0; i < float32Data.length; i++) {
          int16Data[i] = Math.max(-1, Math.min(1, float32Data[i]!)) * 32767;
        }

        // 5. Convert Int16Array to Base64 string
        const uint8Data = new Uint8Array(int16Data.buffer);
        let binaryString = "";
        for (let i = 0; i < uint8Data.byteLength; i++) {
          binaryString += String.fromCharCode(uint8Data[i]!);
        }
        const base64Audio = window.btoa(binaryString);

        // 6. Send the chunk to Gemini
        wsRef.current.send(
          JSON.stringify({
            realtimeInput: {
              // Replaced mediaChunks array with the direct audio object
              audio: {
                mimeType: "audio/pcm;rate=16000",
                data: base64Audio,
              },
            },
          }),
        );
      };

      // Connect the pipeline
      source.connect(processor);
      processor.connect(audioCtx.destination); // Required for the processor to run

      setIsMicOn(true);
      console.log("Microphone is streaming to Gemini!");
    } catch (error) {
      console.error("Microphone access denied or failed:", error);
    }
  };

  const stopMicrophone = () => {
    if (micProcessorRef.current && micAudioCtxRef.current) {
      micProcessorRef.current.disconnect();
      micAudioCtxRef.current.close();
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsMicOn(false);
    console.log("Microphone stopped.");
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-bold">Status: {status}</h2>

      {status === "Idle" || status === "Disconnected" ? (
        <button
          onClick={connectToGemini}
          className="bg-blue-600 text-white px-4 py-2 rounded max-w-xs"
        >
          Connect AI
        </button>
      ) : (
        <button
          onClick={disconnect}
          className="bg-red-600 text-white px-4 py-2 rounded max-w-xs"
        >
          End Interview
        </button>
      )}

      {status === "Connected" && (
        <div className="flex flex-col gap-4 mt-4">
          {/* Microphone Toggle */}
          <div>
            {!isMicOn ? (
              <button
                onClick={startMicrophone}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Turn On Microphone
              </button>
            ) : (
              <button
                onClick={stopMicrophone}
                className="bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Mute Microphone
              </button>
            )}
          </div>

          {/* Existing Text Input */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Or type a message..."
            />
            <button
              onClick={() => {
                if (userInput.trim() === "") return;
                sendTextMessage(userInput);
                setUserInput("");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Send Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiLiveAssistant;
