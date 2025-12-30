import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface BackgroundMusicProps {
  isTimerActive: boolean;
  timerDuration: number;
  timeLeft: number;
  resetCounter: number;
  isNewSession: boolean;
}

// YouTube Music categories with curated satisfying study playlists
const musicCategories = {
  lofi: {
    name: 'Lo-Fi Beats',
    tracks: [
      { id: '1', name: 'Lo-Fi Hip Hop Radio - Beats to Relax/Study', videoId: 'jfKfPfyJRdk', duration: 3600 },
      { id: '2', name: 'Cozy Coffee Shop Ambience - Lo-Fi Study Music', videoId: '5qap5aO4i9A', duration: 3600 },
      { id: '3', name: 'Forest Sounds with Lo-Fi Music', videoId: 'lTRiuFIWV54', duration: 3600 }
    ]
  },
  focus: {
    name: 'Focus & Deep Work',
    tracks: [
      { id: '4', name: 'Deep Focus Music - Improve Concentration', videoId: 'WPni755-Krg', duration: 3600 },
      { id: '5', name: 'Binaural Beats for Study - 40Hz Gamma Waves', videoId: 'RtMx64k_wOQ', duration: 3600 },
      { id: '6', name: 'Piano Music for Studying and Focus', videoId: 'O9y_AVYMEUs', duration: 3600 }
    ]
  },
  ambient: {
    name: 'Ambient & Nature',
    tracks: [
      { id: '7', name: 'Rain Sounds for Sleeping & Studying', videoId: 'mPZkdNFkNps', duration: 3600 },
      { id: '8', name: 'Forest Sounds - Birds & Nature Ambience', videoId: 'xNN7iTA57jM', duration: 3600 },
      { id: '9', name: 'Crackling Fireplace with Soft Piano', videoId: 'L_LUpnjgPso', duration: 3600 }
    ]
  }
};

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  isTimerActive,
  timerDuration,
  timeLeft,
  resetCounter,
  isNewSession
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [selectedCategory, setSelectedCategory] = useState<string>('lofi');
  const [currentTrack, setCurrentTrack] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [musicPermission, setMusicPermission] = useState<boolean | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [previousTimerState, setPreviousTimerState] = useState(false);
  const [prevResetCounter, setPrevResetCounter] = useState(0);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current category tracks
  const currentCategoryTracks = musicCategories[selectedCategory as keyof typeof musicCategories]?.tracks || [];
  const activeTrack = currentCategoryTracks[currentTrack];

  // Cleanup on unmount and page close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
        playerRef.current.stopVideo();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (playerRef.current && typeof playerRef.current.stopVideo === 'function') {
        playerRef.current.stopVideo();
      }
    };
  }, []);

  // Load YouTube API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT) {
        initializePlayer();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onload = () => {
        window.onYouTubeIframeAPIReady = initializePlayer;
      };
      document.head.appendChild(script);
    };

    const initializePlayer = () => {
      if (!window.YT || !activeTrack) return;

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: activeTrack.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          loop: 1,
          playlist: activeTrack.videoId
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
            if (playerRef.current) {
              playerRef.current.setVolume(volume[0]);
            }
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              nextTrack();
            }
          }
        }
      });
    };

    loadYouTubeAPI();
  }, [activeTrack]);

  // Handle timer state changes - only pause/sync, never auto-play
  useEffect(() => {
    if (!playerRef.current || !playerReady || typeof playerRef.current.playVideo !== 'function' || typeof playerRef.current.pauseVideo !== 'function') {
      return;
    }

    // Check if timer just started (from false to true)
    const timerJustStarted = !previousTimerState && isTimerActive;
    setPreviousTimerState(isTimerActive);

    // If timer just started and it's a new session and we haven't asked permission yet, show dialog
    if (timerJustStarted && isNewSession && musicPermission === null) {
      setShowPermissionDialog(true);
      return;
    }

    // ONLY pause music when timer pauses - NEVER auto-start music
    // Music must be manually started by user clicking play button
    if (musicPermission === true && !isTimerActive && isPlaying) {
      // Timer paused but music is playing - pause music
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, [isTimerActive, musicPermission, playerReady, previousTimerState, isNewSession, isPlaying]);

  // Handle fade out when timer ends
  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0 && isPlaying && playerRef.current) {
      setFadeOut(true);
      const fadeInterval = setInterval(() => {
        setVolume(prev => {
          const newVolume = Math.max(0, prev[0] - 5);
          playerRef.current?.setVolume(newVolume);
          return [newVolume];
        });
      }, 500);

      return () => clearInterval(fadeInterval);
    } else if (timeLeft === 0 && isPlaying) {
      stopMusic();
      setFadeOut(false);
    }
  }, [timeLeft, isPlaying]);

  const playMusic = () => {
    // Only allow manual music play - never auto-play
    if (playerRef.current && playerReady && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const pauseMusic = () => {
    if (playerRef.current && playerReady && typeof playerRef.current.pauseVideo === 'function') {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  };

  const stopMusic = () => {
    if (playerRef.current && playerReady && typeof playerRef.current.stopVideo === 'function') {
      playerRef.current.stopVideo();
      setIsPlaying(false);
      setVolume([50]); // Reset volume
    }
  };

  // Update volume in real-time
  useEffect(() => {
    if (playerRef.current && playerReady && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume[0]);
    }
  }, [volume, playerReady]);

  const nextTrack = () => {
    if (currentCategoryTracks.length > 1) {
      const newTrackIndex = (currentTrack + 1) % currentCategoryTracks.length;
      setCurrentTrack(newTrackIndex);
      const newTrack = currentCategoryTracks[newTrackIndex];
      
      if (playerRef.current && playerReady && newTrack && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(newTrack.videoId);
        if (isPlaying && typeof playerRef.current.playVideo === 'function') {
          setTimeout(() => {
            if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
              playerRef.current.playVideo();
            }
          }, 500);
        }
      }
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  const handleMusicPermission = (allowed: boolean) => {
    setMusicPermission(allowed);
    setShowPermissionDialog(false);
    
    // Do NOT auto-play even if permission is granted
    // User must manually click play button to start music
  };

  // Handle timer reset - change track and reset music permission when reset is pressed
  useEffect(() => {
    if (resetCounter > prevResetCounter && prevResetCounter > 0) {
      setPrevResetCounter(resetCounter);
      
      // Reset music permission so it asks again on next start
      setMusicPermission(null);
      
      if (playerRef.current && playerReady && typeof playerRef.current.stopVideo === 'function') {
        // Stop current music
        if (isPlaying) {
          playerRef.current.stopVideo();
          setIsPlaying(false);
        }
        
        // Change to next track
        nextTrack();
      }
    } else {
      setPrevResetCounter(resetCounter);
    }
  }, [resetCounter, prevResetCounter, playerReady, isPlaying]);

  // Handle category/track changes
  useEffect(() => {
    if (playerRef.current && playerReady && activeTrack && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(activeTrack.videoId);
      setIsPlaying(false);
    }
  }, [selectedCategory, currentTrack, playerReady]);

  return (
    <>
      {/* Music Permission Dialog */}
      <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🎵 Would you like to play background music?</AlertDialogTitle>
            <AlertDialogDescription>
              We can play relaxing study music automatically when you start your focus sessions. 
              You can always change this later or control the music manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleMusicPermission(false)}>
              No thanks
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleMusicPermission(true)}>
              Yes, play music
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {/* Hidden YouTube player */}
        <div id="youtube-player" style={{ display: 'none' }}></div>
      
      <Card className="shadow-forest bg-gradient-forest border-forest-light overflow-hidden">
        {/* Compact Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-tree-bright" />
                <h3 className="font-medium">Background Music</h3>
              </div>
              
              {isPlaying && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Badge variant="outline" className="border-tree-bright text-tree-bright">
                    Playing
                  </Badge>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMusic}
                className="hover:bg-forest-light"
                disabled={!playerReady}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-forest-light"
              >
                <Music className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Current Track Display */}
          {(isPlaying || isExpanded) && activeTrack && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-forest-light"
            >
              <div className="text-sm text-muted-foreground">
                Now Playing: <span className="text-foreground font-medium">{activeTrack.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {musicCategories[selectedCategory as keyof typeof musicCategories]?.name}
              </div>
            </motion.div>
          )}
        </div>

        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-forest-light"
            >
              <div className="p-4 space-y-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Music Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-forest-dark border-forest-light">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(musicCategories).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Track List */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tracks</label>
                  <div className="space-y-1">
                    {currentCategoryTracks.map((track, index) => (
                      <div
                        key={track.id}
                        className={`
                          p-2 rounded text-sm cursor-pointer transition-colors
                          ${index === currentTrack 
                            ? 'bg-primary/20 text-primary border border-primary/40' 
                            : 'bg-forest-dark hover:bg-forest-light'
                          }
                        `}
                        onClick={() => setCurrentTrack(index)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{track.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(track.duration / 60)}min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Volume</label>
                    <div className="flex items-center gap-2">
                      {volume[0] === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      <span className="text-xs text-muted-foreground min-w-[3ch]">
                        {volume[0]}%
                      </span>
                    </div>
                  </div>
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                </div>

                {/* Track Controls */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextTrack}
                    disabled={currentCategoryTracks.length <= 1}
                    className="border-forest-light hover:bg-forest-light"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Next Track
                  </Button>
                </div>

                  {/* Music Note */}
                  <div className="text-xs text-muted-foreground bg-forest-dark p-3 rounded">
                    <p>🎵 Click play/pause to control music manually during your focus sessions.</p>
                    <p className="mt-1">🎧 Music will pause automatically when you pause the timer.</p>
                    <p className="mt-1">📡 Requires internet connection to stream music from YouTube.</p>
                    {!playerReady && (
                      <p className="mt-1 text-yellow-400">⏳ Loading YouTube player...</p>
                    )}
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
    </>
  );
};