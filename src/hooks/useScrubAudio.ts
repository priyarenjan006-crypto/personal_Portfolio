import { useCallback, useEffect, useRef, useState } from "react";

/** Play the audio backwards while the user scrolls back up, like scrubbing tape. */
const REVERSE_ON_SCROLL_UP = true;
/** Seconds of silence in scroll input before the voice fades out. */
const IDLE_STOP_MS = 240;
/** Max distance (s) between audio and video before the audio jumps to catch up. */
const RESYNC_THRESHOLD = 0.3;
const FADE = 0.04;

type Voice = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  direction: 1 | -1;
  offset: number;
  startedAt: number;
  rate: number;
};

export type ScrubAudio = {
  /** User preference: sound muted. */
  muted: boolean;
  /** Browser audio has been unlocked by a user gesture. */
  unlocked: boolean;
  /** Toggle sound, unlocking the audio context on first use. */
  toggle: () => void;
  /** Sync audio to a video timestamp (seconds) moving in `direction`. */
  scrub: (time: number, direction: 1 | -1) => void;
};

function reverseBuffer(ctx: AudioContext, buffer: AudioBuffer): AudioBuffer {
  const reversed = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = Float32Array.from(buffer.getChannelData(c)).reverse();
    reversed.copyToChannel(data, c);
  }
  return reversed;
}

/**
 * Scroll-scrubbed audio: plays the hero video's soundtrack in lock-step with the
 * frame being shown, steering playback rate to follow scroll speed and fading
 * out as soon as scrolling stops.
 */
export function useScrubAudio(url: string): ScrubAudio {
  const [muted, setMuted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const buffers = useRef<{ forward: AudioBuffer; reverse: AudioBuffer } | null>(null);
  const encoded = useRef<Promise<ArrayBuffer | null> | null>(null);
  const voice = useRef<Voice | null>(null);
  const idleTimer = useRef<number>(0);
  const mutedRef = useRef(muted);

  // Fetch the encoded audio early so unlocking is instant.
  useEffect(() => {
    encoded.current = fetch(url)
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .catch(() => null);
  }, [url]);

  const stopVoice = useCallback((fade = FADE * 1.5) => {
    const ctx = ctxRef.current;
    const current = voice.current;
    if (!ctx || !current) return;
    const now = ctx.currentTime;
    current.gain.gain.cancelScheduledValues(now);
    current.gain.gain.setValueAtTime(current.gain.gain.value, now);
    current.gain.gain.linearRampToValueAtTime(0, now + fade);
    try {
      current.source.stop(now + fade + 0.01);
    } catch {
      // Source already stopped.
    }
    voice.current = null;
  }, []);

  const unlock = useCallback(async (): Promise<void> => {
    if (ctxRef.current) {
      await ctxRef.current.resume();
      setUnlocked(ctxRef.current.state === "running");
      return;
    }
    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      await ctx.resume();
      setUnlocked(ctx.state === "running");
      const data = await encoded.current;
      if (!data) return;
      const forward = await ctx.decodeAudioData(data.slice(0));
      buffers.current = { forward, reverse: reverseBuffer(ctx, forward) };
    } catch (error) {
      console.error("Hero audio unavailable:", error);
    }
  }, []);

  // The first click / key / tap anywhere unlocks audio (scroll alone cannot, by browser policy).
  useEffect(() => {
    const events = ["pointerdown", "keydown", "touchend"] as const;
    const onGesture = (event: Event) => {
      // The sound toggle handles its own click; unlocking here too would make that click mute.
      if (event.target instanceof Element && event.target.closest("[data-sound-toggle]")) return;
      if (!mutedRef.current) void unlock();
      events.forEach((e) => window.removeEventListener(e, onGesture));
    };
    events.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onGesture));
  }, [unlock]);

  useEffect(() => {
    mutedRef.current = muted;
    if (muted) stopVoice();
  }, [muted, stopVoice]);

  useEffect(
    () => () => {
      window.clearTimeout(idleTimer.current);
      void ctxRef.current?.close();
    },
    [],
  );

  const toggle = useCallback(() => {
    if (!unlocked) {
      setMuted(false);
      void unlock();
      return;
    }
    setMuted((m) => !m);
  }, [unlocked, unlock]);

  const scrub = useCallback(
    (time: number, direction: 1 | -1) => {
      const ctx = ctxRef.current;
      const buf = buffers.current;
      if (mutedRef.current || !ctx || !buf || ctx.state !== "running") return;
      if (direction === -1 && !REVERSE_ON_SCROLL_UP) return;

      const duration = buf.forward.duration;
      const target = Math.min(duration, Math.max(0, direction === 1 ? time : duration - time));
      const now = ctx.currentTime;
      const current = voice.current;
      const position = current ? current.offset + (now - current.startedAt) * current.rate : NaN;

      if (!current || current.direction !== direction || Math.abs(target - position) > RESYNC_THRESHOLD) {
        stopVoice();
        if (target >= duration - 0.05) return;
        const source = ctx.createBufferSource();
        source.buffer = direction === 1 ? buf.forward : buf.reverse;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + FADE);
        source.connect(gain).connect(ctx.destination);
        source.start(now, target);
        const next: Voice = { source, gain, direction, offset: target, startedAt: now, rate: 1 };
        source.onended = () => {
          if (voice.current === next) voice.current = null;
        };
        voice.current = next;
      } else {
        // Nudge speed toward the scroll position instead of jumping.
        const rate = Math.min(1.35, Math.max(0.75, 1 + (target - position) * 1.5));
        current.source.playbackRate.setTargetAtTime(rate, now, 0.05);
        current.offset = position;
        current.startedAt = now;
        current.rate = rate;
      }

      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => stopVoice(0.12), IDLE_STOP_MS);
    },
    [stopVoice],
  );

  return { muted, unlocked, toggle, scrub };
}
