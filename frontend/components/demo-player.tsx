"use client";

import { AlertCircle, Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { formatTime } from "@/lib/utils";

export function DemoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  };

  return (
    <div className="demo-player">
      <div className="demo-player-screen">
        <video
          ref={videoRef}
          className="demo-video"
          src="/demo.mp4"
          preload="metadata"
          playsInline
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setVideoUnavailable(true)}
        />
        {videoUnavailable && (
          <div className="demo-video-placeholder">
            <div className="demo-placeholder-art" aria-hidden="true">
              <div className="demo-placeholder-glow" />
              <AudioLinesPlaceholder />
              <span className="demo-placeholder-play"><Play size={22} fill="currentColor" /></span>
            </div>
            <div className="demo-placeholder-message">
              <span className="demo-placeholder-label"><AlertCircle size={13} /> DEMO VIDEO COMING SOON</span>
              <p>Add the demo recording at <code>frontend/public/demo.mp4</code> to play it here.</p>
            </div>
          </div>
        )}
        {!videoUnavailable && !playing && (
          <button className="demo-center-play" type="button" aria-label="Play demo video" onClick={togglePlayback}>
            <Play size={22} fill="currentColor" />
          </button>
        )}
      </div>
      <div className="demo-controls">
        <button className="demo-control-button" type="button" aria-label={playing ? "Pause video" : "Play video"} onClick={togglePlayback}>
          {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
        </button>
        <span className="demo-time">{formatTime(currentTime)} <span>/</span> {formatTime(duration)}</span>
        <input
          className="demo-scrubber"
          type="range"
          aria-label="Seek video"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          disabled={videoUnavailable || !duration}
          onChange={(event) => {
            const time = Number(event.target.value);
            if (videoRef.current) videoRef.current.currentTime = time;
            setCurrentTime(time);
          }}
          style={{ "--demo-progress": `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties}
        />
        <button
          className="demo-control-button"
          type="button"
          aria-label={muted ? "Unmute video" : "Mute video"}
          onClick={() => {
            setMuted((value) => !value);
            if (videoRef.current) videoRef.current.muted = !muted;
          }}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
        <button
          className="demo-control-button"
          type="button"
          aria-label="Fullscreen video"
          onClick={() => { void videoRef.current?.parentElement?.requestFullscreen(); }}
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}

function AudioLinesPlaceholder() {
  return (
    <div className="demo-placeholder-wave" aria-hidden="true">
      {Array.from({ length: 31 }, (_, index) => (
        <i key={index} style={{ height: `${18 + ((index * 17 + 11) % 70)}%` }} />
      ))}
    </div>
  );
}
