import React, {useEffect, useRef, useState} from "react";
import "./VoiceButton.css";
import {type AllTasks, pipeline} from "@huggingface/transformers";

export type Status = "idle" | "loading-model" | "recording" | "transcribing" | "error";

interface VoiceButtonProps {
    onToggle?: (active: boolean) => void;
    onTranscript?: (text: string) => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({onToggle, onTranscript}) => {
    const [isListening, setIsListening] = useState(false);
    const [status, setStatus] = useState<Status>("loading-model");
    const [error, setError] = useState("");


    // Neu: kurzer “grün”-Flash wenn Modell fertig
    const [readyFlash, setReadyFlash] = useState(false);
    const prevStatusRef = useRef<Status>("loading-model");

    const transcriberRef = useRef<null | AllTasks["automatic-speech-recognition"]>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);


// Ready-Flash beim Übergang -> idle
    useEffect(() => {
        const prev = prevStatusRef.current;

        if (prev !== "idle" && status === "idle") {
            setReadyFlash(true);
            const t = window.setTimeout(() => setReadyFlash(false), 800);
            return () => window.clearTimeout(t);
        }

        prevStatusRef.current = status;
    }, [status]);


    // flash the microphone button when model is ready to use
    useEffect(() => {
        const prev = prevStatusRef.current;
        const curr = status;

        if (prev !== "idle" && curr === "idle") {
            setReadyFlash(true);
            const t = window.setTimeout(() => setReadyFlash(false), 900);
            return () => window.clearTimeout(t);
        }

        prevStatusRef.current = curr;
    }, [status]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setError("");
                setStatus("loading-model");

                transcriberRef.current = await pipeline(
                    "automatic-speech-recognition",
                    "Xenova/whisper-tiny",
                    {device: "auto"}
                );

                if (!cancelled) setStatus("idle");
            } catch (e) {
                if (!cancelled) {
                    setStatus("error");
                    setError(String(e));
                }
            }
        })();

        //:TODO handle errors to the UI
        return () => {
            cancelled = true;
            try {
                recorderRef.current?.stop();
            } catch {
            }
            try {
                streamRef.current?.getTracks().forEach((t) => t.stop());
            } catch {
            }
        };
    }, []);

    const stopRecording = () => {
        try {
            recorderRef.current?.stop();
        } catch (e) {
            setStatus("error");
            setError(String(e));
        }
    };

    const startRecording = async () => {
        try {
            setError("");

            chunksRef.current = [];

            if (!transcriberRef.current) {
                setStatus("error");
                setError("Model ist noch nicht geladen.");
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            streamRef.current = stream;

            const recorder = new MediaRecorder(stream);
            recorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                try {
                    setStatus("transcribing");

                    const blob = new Blob(chunksRef.current, {type: recorder.mimeType});
                    const audioURL = URL.createObjectURL(blob);

                    const output = await transcriberRef.current!(
                        audioURL,
                        {task: "transcribe", language: "german"}
                    );

                    let text = "";
                    if (Array.isArray(output)) text = output.map((o) => o.text).join(" ");
                    else text = output.text ?? "";

                    const finalText = text || "(keine Sprache erkannt)";

                    onTranscript?.(finalText);

                    setStatus("idle");
                    URL.revokeObjectURL(audioURL);
                } catch (e) {
                    setStatus("error");
                    setError(String(e));
                } finally {
                    try {
                        streamRef.current?.getTracks().forEach((t) => t.stop());
                    } catch {
                    }
                    streamRef.current = null;
                }
            };

            recorder.start();
            setStatus("recording");
        } catch (e) {
            setStatus("error");
            setError(String(e));
        }
    };

    const handleClick = async () => {

        if (status === "loading-model" || status === "transcribing" || status === "error") return;

        const next = !isListening;
        setIsListening(next);
        onToggle?.(next);

        if (next) await startRecording();
        else stopRecording();
    };
    return (
        <button
            className={[
                "voice-button",
                isListening ? "active" : "",
                readyFlash ? "ready-flash" : "",
            ].join(" ")}
            onClick={handleClick}
            disabled={status !== "idle" && status !== "recording"}
        >
            🎤
        </button>

    );
};

export default VoiceButton;
