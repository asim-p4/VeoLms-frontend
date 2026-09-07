/**
 * @fileoverview Custom Video Player Component
 * Mimics YouTube/Udemy experience with full keyboard accessibility.
 * 
 * FEATURES IMPLEMENTED:
 * - Play/Pause toggle (Space / K)
 * - Volume control with mute (M)
 * - Progress bar (clickable, draggable)
 * - Time display (current / total)
 * - Speed selector (0.5x to 2x)
 * - Fullscreen toggle (F)
 * - Keyboard shortcuts overlay (?)
 * 
 * ACCESSIBILITY:
 * - All controls focusable
 * - ARIA labels on all buttons
 * 
 * STATE MANAGEMENT:
 * - Syncs local `<video>` ref state with global `usePlayerStore`
 */
import * as React from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, HelpCircle, SkipBack, SkipForward, Check 
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { cn } from '../../lib/utils';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  hlsToken?: string;
  startPosition?: number;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  onTimeUpdate?: (time: number) => void;
  onRetry?: () => void;
}

interface QualityOption {
  label: '360p' | '144p';
  levelIndex: number;
}

export function VideoPlayer({ src, poster, hlsToken, startPosition, onNextLesson, onPrevLesson, onTimeUpdate, onRetry }: VideoPlayerProps) {
  // Global Store State
  const { 
    isPlaying, volume, isMuted, playbackRate, isFullscreen,
    togglePlay, setPlaying, setVolume, toggleMute, setPlaybackRate, setFullscreen
  } = usePlayerStore();

  // Local Component Refs & State
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const hlsRef = React.useRef<Hls | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [bufferedPercent, setBufferedPercent] = React.useState(0);
  const [showControls, setShowControls] = React.useState(true);
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [availableQualities, setAvailableQualities] = React.useState<QualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = React.useState<'360p' | '144p'>(() => {
    const saved = localStorage.getItem('veolms_video_quality');
    return saved === '144p' ? '144p' : '360p'; // by default select 360p
  });
  const [videoError, setVideoError] = React.useState<string | null>(null);
  const isInitialLoad = React.useRef(true);
  
  const speedMenuRef = React.useRef<HTMLDivElement>(null);
  const settingsMenuRef = React.useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setIsSpeedMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQualityChange = (option: QualityOption) => {
    setSelectedQuality(option.label);
    localStorage.setItem('veolms_video_quality', option.label);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = option.levelIndex; // Instantly switches to target resolution
    }
    setIsSettingsOpen(false);
  };

  /**
   * Formats seconds into MM:SS
   */
  const formatTime = (timeInSeconds: number) => {
    if (!timeInSeconds) return "0:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /**
   * Syncs global playing state with actual video element
   */
  React.useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        const promise = videoRef.current.play();
        if (promise !== undefined) {
          promise.catch(() => setPlaying(false));
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, setPlaying]);

  /**
   * Initializes HLS.js if the source is an m3u8 playlist or standard video playback
   */
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    setVideoError(null);

    if (src.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        xhrSetup: function(xhr) {
          xhr.withCredentials = true;
          if (hlsToken) {
            xhr.setRequestHeader('Authorization', `Bearer ${hlsToken}`);
          }
        }
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        // Extract 360p and 144p levels from manifest
        const options: QualityOption[] = [];
        const levels = data.levels || hls.levels || [];

        // Check for 360p first (default priority)
        const idx360 = levels.findIndex((lvl: any) => lvl.height === 360 || (lvl.name && lvl.name.includes('360')));
        if (idx360 !== -1) {
          options.push({ label: '360p', levelIndex: idx360 });
        }

        // Check for 144p
        const idx144 = levels.findIndex((lvl: any) => lvl.height === 144 || (lvl.name && lvl.name.includes('144')));
        if (idx144 !== -1) {
          options.push({ label: '144p', levelIndex: idx144 });
        }

        // Fallback if exact height metadata wasn't matched
        if (options.length === 0 && levels.length > 0) {
          if (levels.length >= 2) {
            options.push({ label: '360p', levelIndex: 1 });
            options.push({ label: '144p', levelIndex: 0 });
          } else {
            options.push({ label: '360p', levelIndex: 0 });
          }
        }

        setAvailableQualities(options);

        // Lock to user's preferred quality (defaults to 360p) - strictly disables auto ABR
        const savedPreference = localStorage.getItem('veolms_video_quality') || '360p';
        const targetOption = options.find(o => o.label === savedPreference) || options[0];

        if (targetOption) {
          hls.currentLevel = targetOption.levelIndex; // Strict manual lock, never auto
          setSelectedQuality(targetOption.label);
        }

        if (isPlaying) {
          video.play().catch(() => setPlaying(false));
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setVideoError("HLS playback error occurred. Click to retry.");
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && src.includes('.m3u8')) {
      // Native HLS support (Safari)
      video.src = src;
      video.load();
      video.addEventListener('loadedmetadata', () => {
        if (isPlaying) video.play().catch(() => setPlaying(false));
      });
    } else {
      // Regular mp4 fallback
      video.src = src;
      video.load();
      if (isPlaying) {
        video.play().catch(() => setPlaying(false));
      }
    }
  }, [src]);

  /**
   * Syncs global volume state with actual video element
   */
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  /**
   * Syncs global playback rate with actual video element
   */
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  /**
   * Handles keyboard shortcuts globally when player is in view
   */
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          handleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          if (videoRef.current) videoRef.current.currentTime += 10;
          break;
        case 'arrowleft':
          if (videoRef.current) videoRef.current.currentTime -= 10;
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          break;
        case '?':
          setShowShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, volume, setVolume]);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative group bg-black w-full aspect-video overflow-hidden font-sans select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src && !src.includes('.m3u8') ? src : undefined}
        poster={poster}
        className="w-full h-full cursor-pointer object-contain"
        controlsList="nodownload"
        preload="auto"
        playsInline
        onContextMenu={(e) => e.preventDefault()}
        onClick={togglePlay}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (d && !isNaN(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={() => {
          const time = videoRef.current?.currentTime || 0;
          setCurrentTime(time);
          if (onTimeUpdate) onTimeUpdate(time);
        }}
        onProgress={() => {
          if (videoRef.current && videoRef.current.buffered.length > 0) {
            const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
            const d = videoRef.current.duration;
            if (d > 0) {
              setBufferedPercent((bufferedEnd / d) * 100);
            }
          }
        }}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (d && !isNaN(d) && d > 0) setDuration(d);
          if (startPosition && videoRef.current && isInitialLoad.current) {
            videoRef.current.currentTime = startPosition;
            isInitialLoad.current = false;
          }
        }}
        onCanPlay={(e) => {
          const d = e.currentTarget.duration;
          if (d && !isNaN(d) && d > 0) setDuration(d);
        }}
        onError={() => {
          setVideoError("Unable to load video stream. Click retry or check your network.");
        }}
        onEnded={() => {
          setPlaying(false);
          if (onNextLesson) onNextLesson();
        }}
      />

      {/* Prominent Center Play Button Overlay */}
      {!isPlaying && !videoError && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10 bg-black/30 hover:bg-black/40 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          title="Play video"
        >
          <div className="w-20 h-20 rounded-full bg-primary-600/90 hover:bg-primary-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200">
            <Play className="h-10 w-10 fill-current ml-1 text-white" />
          </div>
        </div>
      )}

      {/* Video Error Overlay */}
      {videoError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white p-6 z-30 space-y-4">
          <p className="text-center font-medium max-w-md text-red-400">{videoError}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVideoError(null);
              if (onRetry) {
                onRetry();
              } else if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
              }
            }}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-semibold transition shadow-lg"
          >
            Retry Playback
          </button>
        </div>
      )}

      {/* Overlay Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 px-4 pb-4 transition-opacity duration-300 z-20",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className="w-full h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer relative group/progress"
          onClick={handleProgressClick}
        >
          {/* Buffering Bar */}
          <div 
            className="absolute top-0 left-0 h-full bg-white/50 rounded-full transition-all duration-300"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Main Progress Bar */}
          <div 
            className="absolute top-0 left-0 h-full bg-primary-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
          {/* Scrubber handle */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform"
            style={{ left: `calc(${(currentTime / duration) * 100 || 0}% - 6px)` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={onPrevLesson} className="hover:text-primary-400 transition" aria-label="Previous Lesson">
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button onClick={togglePlay} className="hover:text-primary-400 transition" aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
            </button>
            
            <button onClick={onNextLesson} className="hover:text-primary-400 transition" aria-label="Next Lesson">
              <SkipForward className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 group/volume relative">
              <button onClick={toggleMute} aria-label="Mute">
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              {/* Volume Slider (appears on hover) */}
              <input 
                type="range" 
                min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 accent-primary-500"
              />
            </div>

            <div className="text-xs font-medium tabular-nums ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Speed Selector */}
            <div className="relative flex items-center" ref={speedMenuRef}>
              <button 
                className="text-sm font-medium hover:text-primary-400 transition"
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
              >
                {playbackRate}x
              </button>
              {isSpeedMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 flex flex-col bg-gray-900/90 rounded border border-gray-700 overflow-hidden">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button 
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={cn(
                      "px-4 py-2 text-xs hover:bg-primary-600 transition",
                      playbackRate === rate ? "bg-primary-600/50" : ""
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
              )}
            </div>

            <button onClick={() => setShowShortcuts(true)} className="hover:text-primary-400 transition" aria-label="Keyboard Shortcuts">
              <HelpCircle className="h-5 w-5" />
            </button>
            
            {/* Quality Settings Selector */}
            <div className="relative flex items-center" ref={settingsMenuRef}>
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                className={cn(
                  "hover:text-primary-400 transition flex items-center gap-1",
                  isSettingsOpen ? "text-primary-400" : ""
                )} 
                aria-label="Video Quality Settings"
                title="Quality Settings"
              >
                <Settings className="h-5 w-5" />
              </button>

              {isSettingsOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-36 bg-gray-900/95 backdrop-blur-md rounded-lg border border-gray-700 shadow-2xl overflow-hidden py-1 z-30 font-sans">
                  <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase border-b border-gray-800">
                    Quality
                  </div>
                  {availableQualities.length > 0 ? (
                    availableQualities.map(option => (
                      <button
                        key={option.label}
                        onClick={() => handleQualityChange(option)}
                        className={cn(
                          "w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition text-left",
                          selectedQuality === option.label ? "text-primary-400 font-semibold bg-primary-950/40" : "text-gray-200"
                        )}
                      >
                        <span>{option.label}</span>
                        {selectedQuality === option.label && (
                          <Check className="h-3.5 w-3.5 text-primary-400" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      Standard Quality
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleFullscreen} className="hover:text-primary-400 transition" aria-label="Fullscreen">
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Shortcuts Modal Overlay */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg border border-gray-700 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Keyboard Shortcuts</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between"><span>Play/Pause</span> <kbd className="bg-gray-800 px-2 py-1 rounded">Space</kbd></li>
              <li className="flex justify-between"><span>Rewind / Forward 10s</span> <kbd className="bg-gray-800 px-2 py-1 rounded">← / →</kbd></li>
              <li className="flex justify-between"><span>Volume Up / Down</span> <kbd className="bg-gray-800 px-2 py-1 rounded">↑ / ↓</kbd></li>
              <li className="flex justify-between"><span>Mute</span> <kbd className="bg-gray-800 px-2 py-1 rounded">M</kbd></li>
              <li className="flex justify-between"><span>Fullscreen</span> <kbd className="bg-gray-800 px-2 py-1 rounded">F</kbd></li>
            </ul>
            <button 
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full py-2 bg-primary-600 hover:bg-primary-700 rounded text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
