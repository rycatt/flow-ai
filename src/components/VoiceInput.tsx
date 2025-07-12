import { Mic } from "lucide-react";
import React, { useRef, useState } from "react";
import {
  SpeechRecognition,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  VoiceInputProps,
} from "../types/speech";

export const VoiceInput = ({ onTranscription }: VoiceInputProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [recording, setRecording] = useState(false);

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    try {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        alert(
          "Speech recognition is not supported in this browser. Please use Chrome or Edge."
        );
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = (finalTranscript + interimTranscript).trim();
        if (fullTranscript) {
          console.log("Transcription:", fullTranscript);
          onTranscription?.(fullTranscript);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setRecording(false);
      };

      recognitionRef.current.onend = () => {
        setRecording(false);
      };

      recognitionRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      alert("Error starting speech recognition. Please try again.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <button
      onClick={toggleRecording}
      className={`
        relative w-10 h-10 rounded-full border-2 transition-all duration-200 ease-in-out
        flex items-center justify-center shadow-sm
        ${
          recording
            ? "bg-red-500 border-red-600 text-white shadow-lg scale-110"
            : "bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
        }
      `}
      disabled={recording}
      title={recording ? "Click to stop" : "Click to start recording"}
    >
      {recording ? (
        <Mic className="w-4 h-4 animate-pulse" />
      ) : (
        <Mic className="w-4 h-4" />
      )}

      {recording && (
        <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
      )}
    </button>
  );
};
