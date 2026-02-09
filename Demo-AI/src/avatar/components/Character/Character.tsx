import { useEffect, useRef, useState } from "react";
import "./Character.css";

// externe Lib ohne Typen – keine Typdefinitionen vorhanden
// @ts-expect-error external lib without types
import { TalkingHead } from "../../lib/talkinghead.mjs";

const HEAD_AUDIO_URL = new URL("../../headaudio/headaudio.mjs", import.meta.url).href;
const HEAD_WORKLET_URL = new URL("../../headaudio/headworklet.mjs", import.meta.url).href;
const HEAD_MODEL_URL = new URL("../../headaudio/model-en-mixed.bin", import.meta.url).href;

const AVATAR_URL = "/RosalindeFranklinWebsiteExport2.glb";
const TTS_PORT = 5179;

// ---------------- Typen ----------------

type AvatarMouthTarget = {
  newvalue: number;
  needsUpdate: boolean;
};

type SpeechGainNode = AudioNode & {
  gain?: { value: number };
};

type TalkingHeadPublic = {
  audioCtx: AudioContext;
  opt: {
    update?: (dt: number) => void;
  };
  mtAvatar?: Record<string, AvatarMouthTarget>;
  showAvatar: (opts: { url: string; body: string; avatarMood: string }) => Promise<void>;
  speakAudio?: (opts: { audio: AudioBuffer }) => Promise<void>;
  stopSpeaking?: () => void;
  dispose?: () => void;

  audioSpeechGainNode?: SpeechGainNode;
  audioSpeechGain?: SpeechGainNode;
  speechGainNode?: SpeechGainNode;
  gainSpeech?: SpeechGainNode;

  [key: string]: unknown;
};

type HeadAudioInstance = {
  loadModel: (url: string) => Promise<void>;
  update: (dt: number) => void;
  onvalue: (key: string, value: number) => void;
};

type HeadAudioCtor = new (ctx: AudioContext, options: unknown) => HeadAudioInstance;

// --------------- Window-Erweiterung ---------------

declare global {
  interface Window {
    avatarSpreche?: (text: string) => Promise<void>;
    head?: TalkingHeadPublic;
  }
}

// --------------- Helper ---------------

function getTtsUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }

  // Immer direkt auf den TTS-Server (Docker mapped 5179 -> Host)
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${TTS_PORT}/api/tts`;
}

function findSpeechNode(head: TalkingHeadPublic): SpeechGainNode | null {
  const candidate: SpeechGainNode | undefined =
      head.audioSpeechGainNode ??
      head.audioSpeechGain ??
      head.speechGainNode ??
      head.gainSpeech;

  if (candidate && typeof candidate.connect === "function") {
    return candidate;
  }
  return null;
}

// --------------- Component ---------------

export default function Character() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<TalkingHeadPublic | null>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;

    async function init() {
      if (typeof window === "undefined") return;

      const container = containerRef.current;
      if (!container) return;

      if (headRef.current) return;

      try {
        container.innerHTML = "";

        const rawHead = new TalkingHead(container, { cameraView: "upper" }) as unknown;
        const head = rawHead as TalkingHeadPublic;
        headRef.current = head;

        await head.showAvatar({
          url: AVATAR_URL,
          body: "F",
          avatarMood: "neutral",
        });

        // Audio-Worklet für HeadAudio
        try {
          await head.audioCtx.audioWorklet.addModule(HEAD_WORKLET_URL);
        } catch (err) {
          console.error("AudioWorklet addModule failed:", err);
        }

        // HeadAudio dynamisch importieren
        let HeadAudioCtorImpl: HeadAudioCtor | null = null;
        try {
          const mod = (await import(
              /* @vite-ignore */ HEAD_AUDIO_URL
              )) as { HeadAudio?: HeadAudioCtor; default?: HeadAudioCtor };

          HeadAudioCtorImpl = mod.HeadAudio ?? mod.default ?? null;
        } catch (err) {
          console.error("HeadAudio import failed:", err);
        }

        if (!HeadAudioCtorImpl) {
          console.error("HeadAudio export not found");
        } else {
          try {
            const ha = new HeadAudioCtorImpl(head.audioCtx, {
              processorOptions: {},
              parameterData: { vadMode: 0 },
            });

            await ha.loadModel(HEAD_MODEL_URL);

            const speechNode = findSpeechNode(head);
            if (!speechNode) {
              console.error("No speech gain node found. Head keys:", Object.keys(head || {}));
            } else {
              try {
                speechNode.connect(ha as unknown as AudioNode);
              } catch (err) {
                console.error("Failed to connect speechNode to HeadAudio:", err);
              }

              if (speechNode.gain) {
                // Lautstärke leicht erhöhen
                speechNode.gain.value = 2.0;
              }
            }

            // Visemes auf Avatar anwenden
            ha.onvalue = (key: string, value: number) => {
              const target = head.mtAvatar?.[key];
              if (!target) return;

              target.newvalue = value;
              target.needsUpdate = true;
            };

            // HeadAudio-Update jede Frame
            head.opt.update = ha.update.bind(ha);
          } catch (err) {
            console.error("HeadAudio init failed:", err);
          }
        }

        if (!disposed) setReady(true);

        // Public API für den Rest der App (TTS)
        window.avatarSpreche = async (text: string) => {
          if (!text || !text.trim()) return;

          try {
            const ttsUrl = getTtsUrl();
            if (!ttsUrl) {
              console.error("TTS URL konnte nicht bestimmt werden.");
              return;
            }

            console.log("[Avatar] Rufe TTS auf:", ttsUrl, "Text:", text);

            if (head.audioCtx.state !== "running") {
              try {
                await head.audioCtx.resume();
              } catch {
                // manche Browser blocken das → ignorieren
              }
            }

            if (typeof head.stopSpeaking === "function") {
              try {
                head.stopSpeaking();
              } catch (error) {
                console.error("stopSpeaking() failed:", error);
              }
            }

            const res = await fetch(ttsUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            });

            if (!res.ok) {
              console.error(
                  "TTS request failed:",
                  res.status,
                  await res.text().catch(() => "")
              );
              return;
            }

            const ct = res.headers.get("Content-Type") || "";
            const isAudio =
                ct.startsWith("audio/") || ct === "application/octet-stream";

            if (!isAudio) {
              console.error(
                  "TTS returned unexpected Content-Type:",
                  ct,
                  await res.text().catch(() => "")
              );
              return;
            }

            const wavBytes = await res.arrayBuffer();
            console.log("[Avatar] TTS bytes:", wavBytes.byteLength);

            const audioBuffer = await head.audioCtx.decodeAudioData(
                wavBytes.slice(0)
            );

            if (typeof head.speakAudio !== "function") {
              console.error("TalkingHead speakAudio() not available");
              return;
            }

            console.log("[Avatar] Spiele Audio ab…");
            await head.speakAudio({ audio: audioBuffer });
          } catch (err) {
            console.error("avatarSpreche failed:", err);
          }
        };

        window.head = head;
      } catch (err) {
        console.error("Character init error:", err);
      }
    }

    void init();

    return () => {
      disposed = true;

      try {
        delete window.avatarSpreche;
        delete window.head;
      } catch (error) {
        console.error("Error cleaning globals:", error);
      }

      try {
        headRef.current?.dispose?.();
      } catch (error) {
        console.error("Error disposing head:", error);
      } finally {
        headRef.current = null;
      }

      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      } catch (error) {
        console.error("Error clearing container:", error);
      }
    };
  }, []);

  return (
      <div className="character-container">
        <div
            ref={containerRef}
            className="character-avatar"
            style={{ width: 360, height: 520 }}
        />
        {!ready && <div style={{ paddingTop: 8 }}>Loading…</div>}
      </div>
  );
}
