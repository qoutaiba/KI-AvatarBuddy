import { useEffect, useRef, useState } from "react";
import "./Character.css";

// @ts-ignore
import { TalkingHead } from "../../lib/talkinghead.mjs";

const HEAD_AUDIO_URL = new URL("../../headaudio/headaudio.mjs", import.meta.url).href;
const HEAD_WORKLET_URL = new URL("../../headaudio/headworklet.mjs", import.meta.url).href;
const HEAD_MODEL_URL = new URL("../../headaudio/model-en-mixed.bin", import.meta.url).href;

const AVATAR_URL = "/RosalindeFranklinWebsiteExport2.glb";
const TTS_PORT = 5179;

declare global {
  interface Window {
    // Public API, call from App.tsx to trigger speech
    avatarSpreche?: (text: string) => Promise<void>;
    head?: any;
  }
}

function getTtsUrl() {
  return `${location.protocol}//${location.hostname}:${TTS_PORT}/api/tts`;
}

function findSpeechNode(head: any) {
  return (
      head.audioSpeechGainNode ||
      head.audioSpeechGain ||
      head.speechGainNode ||
      head.gainSpeech ||
      null
  );
}

export default function Character() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;

    async function init() {
      const container = containerRef.current;
      if (!container) return;
      if (headRef.current) return;

      try {
        // avoid duplicate canvases
        container.innerHTML = "";

        const head = new TalkingHead(container, { cameraView: "upper" });
        headRef.current = head;

        await head.showAvatar({
          url: AVATAR_URL,
          body: "F",
          avatarMood: "neutral",
        });

        // Audio worklet for HeadAudio
        await head.audioCtx.audioWorklet.addModule(HEAD_WORKLET_URL);

        // Dynamic import of HeadAudio module
        const mod = await import(/* @vite-ignore */ HEAD_AUDIO_URL);
        const HeadAudio = mod.HeadAudio || mod.default;
        if (!HeadAudio) throw new Error("HeadAudio export not found");

        const ha = new HeadAudio(head.audioCtx, {
          processorOptions: {},
          parameterData: { vadMode: 0 },
        });

        await ha.loadModel(HEAD_MODEL_URL);

        // Connects speech chain into HeadAudio
        const speechNode = findSpeechNode(head);
        if (!speechNode) {
          console.error("No speech gain node found. Head keys:", Object.keys(head));
          return;
        }

        speechNode.connect(ha);

        if (speechNode.gain) speechNode.gain.value = 2.0;

        // Applys viseme values to the avatar
        ha.onvalue = (key: string, value: number) => {
          const target = head.mtAvatar?.[key];
          if (!target) return;

          target.newvalue = value;
          target.needsUpdate = true;
        };

        // HeadAudio updates every frame
        head.opt.update = ha.update.bind(ha);

        if (!disposed) setReady(true);

        // Expose a simple API for the rest of the app
        window.avatarSpreche = async (text: string) => {
          if (!text?.trim()) return;

          try {
            if (head.audioCtx.state !== "running") {
              await head.audioCtx.resume().catch(() => {});
            }

            // Stop previous speech if available
            if (typeof head.stopSpeaking === "function") {
              try {
                head.stopSpeaking();
              } catch(error) {
                console.error(error)
              }
            }

            const res = await fetch(getTtsUrl(), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            });

            if (!res.ok) {
              console.error("TTS request failed:", res.status, await res.text());
              return;
            }

            const ct = res.headers.get("Content-Type") || "";
            if (!ct.startsWith("audio/")) {
              console.error("TTS returned non-audio:", ct, await res.text());
              return;
            }

            const wavBytes = await res.arrayBuffer();
            const audioBuffer = await head.audioCtx.decodeAudioData(wavBytes.slice(0));

            if (typeof head.speakAudio !== "function") {
              console.error("TalkingHead speakAudio() not available");
              return;
            }

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

    init();

    return () => {
      disposed = true;

      // Remove globals
      try {
        delete window.avatarSpreche;
        delete window.head;
      } catch (error) {console.error(error)}

      // Dispose head instance if supported
      try {
        headRef.current?.dispose?.();
      } catch(error) {console.error(error)} finally {
        headRef.current = null;
      }

      // Clear container
      try {
        if (containerRef.current) (containerRef.current.innerHTML = "");
      } catch (error) {console.error(error)}
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
