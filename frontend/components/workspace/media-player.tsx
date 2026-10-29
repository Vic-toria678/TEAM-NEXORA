"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useProjectStore } from "@/stores/useProjectStore";
import { formatTime } from "@/lib/utils";

export function MediaPlayer() {
  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const file = useProjectStore((state) => state.file);
  const mediaUrl = useProjectStore((state) => state.mediaUrl);
  const seekTime = useProjectStore((state) => state.seekTime);
  const seekRequest = useProjectStore((state) => state.seekRequest);
  const pauseRequest = useProjectStore((state) => state.pauseRequest);
  const currentTime = useProjectStore((state) => state.currentTime);
  const setCurrentTime = useProjectStore((state) => state.setCurrentTime);
  const setMediaPlaying = useProjectStore((state) => state.setMediaPlaying);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const isAudio = Boolean(file?.type.startsWith("audio/"));

  useEffect(() => {
    const media = mediaRef.current;
    if (media && seekTime !== null) {
      media.currentTime = seekTime;
      media.play().then(() => { setPlaying(true); setMediaPlaying(true); }).catch(() => { setPlaying(false); setMediaPlaying(false); });
    }
  }, [seekRequest]);

  useEffect(() => {
    if (pauseRequest > 0) {
      mediaRef.current?.pause();
      setPlaying(false);
      setMediaPlaying(false);
    }
  }, [pauseRequest]);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) media.play().then(() => { setPlaying(true); setMediaPlaying(true); }).catch(() => { setPlaying(false); setMediaPlaying(false); });
    else { media.pause(); setPlaying(false); setMediaPlaying(false); }
  };

  const MediaElement = isAudio ? "audio" : "video";

  return (
    <div className="player-panel">
      <div className={`player-screen ${isAudio ? "player-audio" : ""}`}>
        {mediaUrl && <MediaElement
          ref={mediaRef}
          src={mediaUrl}
          controls={false}
          preload="metadata"
          playsInline
          className="h-full w-full object-contain"
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            const mediaDuration = event.currentTarget.duration || 0;
            setDuration(mediaDuration);
            if (currentTime > 0) {
              const restoredTime = Math.min(currentTime, mediaDuration);
              event.currentTarget.currentTime = restoredTime;
              setCurrentTime(restoredTime);
            }
          }}
          onPlay={() => { setPlaying(true); setMediaPlaying(true); }}
          onPause={() => { setPlaying(false); setMediaPlaying(false); }}
          onEnded={() => { setPlaying(false); setMediaPlaying(false); }}
        />}
        {isAudio && <div className="audio-cover"><span className="audio-cover-icon"><Volume2 size={25} /></span><span className="text-xs tracking-[0.17em] text-muted">AUDIO PREVIEW</span></div>}
        {!isAudio && !file?.type.startsWith("video/") && <div className="audio-cover"><span className="audio-cover-icon"><Volume2 size={25} /></span><span className="text-xs tracking-[0.17em] text-muted">MEDIA PREVIEW</span></div>}
      </div>
      <div className="player-controls">
        <button type="button" aria-label={playing ? "Pause media" : "Play media"} className="player-play" onClick={togglePlay}>{playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button>
        <span className="player-time">{formatTime(currentTime)} <span>/</span> {formatTime(duration)}</span>
        <input aria-label="Seek media" type="range" min={0} max={duration || 0} step={0.1} value={currentTime} onChange={(event) => { const time = Number(event.target.value); if (mediaRef.current) mediaRef.current.currentTime = time; setCurrentTime(time); }} className="player-scrubber" />
        <button type="button" className="player-volume" aria-label={muted ? "Unmute media" : "Mute media"} onClick={() => { setMuted((value) => !value); if (mediaRef.current) mediaRef.current.muted = !muted; }}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
      </div>
    </div>
  );
}
