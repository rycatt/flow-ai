import React, { useRef, useState } from "react";
import {
  SpeechRecognition,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  VoiceInputProps,
} from "../types/speech";
import { Button } from "./ui/button";

export const VoiceInput = ({ onTranscription }: VoiceInputProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [recording, setRecording] = useState(false);

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
    <Button
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
    >
      {recording ? "Recording..." : "Hold to Speak"}
    </Button>
  );
};
