import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Settings, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ForestGrowth } from './ForestGrowth';
import { TimerSettings } from './TimerSettings';
import { ProgressCalendar } from './ProgressCalendar';
import { BackgroundMusic } from './BackgroundMusic';
import { CustomSessions } from './CustomSessions';
import { format, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PomodoroSession {
  type: 'work' | 'break' | 'longBreak';
  duration: number;
  completedAt?: Date;
}

interface SessionHistoryEntry {
  date: Date;
  sessions: number;
  totalFocusTime: number;
}

interface CustomSession {
  id: string;
  name: string;
  description?: string;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  totalSessions: number;
  color: string;
}

export const PomodoroTimer: React.FC = () => {
  const { user } = useAuth();
  
  // Timer state
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState<PomodoroSession['type']>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [isNewSession, setIsNewSession] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Session history for calendar
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>([]);

  // Settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  });

  // Calculate progress percentage
  const getCurrentDuration = () => {
    switch (currentSession) {
      case 'work': return settings.workDuration * 60;
      case 'break': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
      default: return settings.workDuration * 60;
    }
  };

  const progress = ((getCurrentDuration() - timeLeft) / getCurrentDuration()) * 100;

  // Load user data from database
  useEffect(() => {
    if (!user || dataLoaded) return;
    
    const loadUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading user data:', error);
          return;
        }

        if (data) {
          setCompletedSessions(data.completed_sessions);
          // Parse session history from JSON
          const historyData = data.session_history as any;
          setSessionHistory(Array.isArray(historyData) ? historyData : []);
          // Parse settings from JSON
          const settingsData = data.settings as any;
          const loadedSettings = settingsData && typeof settingsData === 'object' ? settingsData : settings;
          setSettings(loadedSettings);
          setTimeLeft(loadedSettings?.workDuration * 60 || 25 * 60);
        }
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading user data:', error);
        setDataLoaded(true);
      }
    };

    loadUserData();
  }, [user, dataLoaded]);

  // Save user data to database
  const saveUserData = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: user.id,
          completed_sessions: completedSessions,
          session_history: sessionHistory as any,
          settings: settings as any
        });

      if (error) {
        console.error('Error saving user data:', error);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionComplete = useCallback(() => {
    setIsActive(false);
    
    if (currentSession === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      // Update session history
      updateSessionHistory(settings.workDuration);
      
      // Determine next session type
      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setCurrentSession('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setCurrentSession('break');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      setCurrentSession('work');
      setTimeLeft(settings.workDuration * 60);
    }
  }, [currentSession, completedSessions, settings]);

  // Save data when important changes occur
  useEffect(() => {
    if (dataLoaded && user) {
      saveUserData();
    }
  }, [completedSessions, sessionHistory, settings, dataLoaded, user]);

  // Update session history
  const updateSessionHistory = (focusTime: number) => {
    const today = new Date();
    setSessionHistory(prev => {
      const existingEntry = prev.find(entry => isSameDay(entry.date, today));
      
      if (existingEntry) {
        return prev.map(entry =>
          isSameDay(entry.date, today)
            ? {
                ...entry,
                sessions: entry.sessions + 1,
                totalFocusTime: entry.totalFocusTime + (focusTime * 60)
              }
            : entry
        );
      } else {
        return [...prev, {
          date: today,
          sessions: 1,
          totalFocusTime: focusTime * 60
        }];
      }
    });
  };

  // Handle custom session selection
  const handleCustomSessionSelect = (customSession: CustomSession) => {
    setSettings({
      workDuration: customSession.workDuration,
      shortBreakDuration: customSession.shortBreakDuration,
      longBreakDuration: customSession.longBreakDuration,
      sessionsUntilLongBreak: customSession.sessionsUntilLongBreak
    });
    
    // Reset timer with new settings
    setIsActive(false);
    setCurrentSession('work');
    setTimeLeft(customSession.workDuration * 60);
  };

  const toggleTimer = () => {
    if (!isActive) {
      setIsNewSession(timeLeft === getCurrentDuration());
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getCurrentDuration());
    setResetCounter(prev => prev + 1); // Trigger reset in BackgroundMusic
    setIsNewSession(true); // Mark as new session for next start
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionLabel = (): string => {
    switch (currentSession) {
      case 'work': return 'Focus Time';
      case 'break': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Focus Time';
    }
  };

  const getSessionColor = (): string => {
    switch (currentSession) {
      case 'work': return 'bg-primary';
      case 'break': return 'bg-tree-leaf';
      case 'longBreak': return 'bg-tree-bright';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-growth bg-clip-text text-transparent">
          PomodoroBuddy
        </h1>
        <p className="text-muted-foreground">
          Focus deeply, grow your forest, achieve your goals
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Timer Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 shadow-forest bg-gradient-forest border-forest-light">
            <div className="space-y-6">
              {/* Session Badge */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className={`${getSessionColor()} text-primary-foreground px-4 py-2`}
                >
                  <Timer className="w-4 h-4 mr-2" />
                  {getSessionLabel()}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="hover:bg-forest-light"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              {/* Timer Display */}
              <div className="text-center space-y-4">
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className={`text-6xl font-mono font-bold ${
                    isActive ? 'animate-pulse-glow' : ''
                  }`}
                >
                  {formatTime(timeLeft)}
                </motion.div>

                {/* Progress Ring */}
                <div className="relative w-32 h-32 mx-auto">
                  <Progress 
                    value={progress} 
                    className="w-full h-2 bg-forest-medium"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className="px-8 bg-primary hover:bg-primary/90 shadow-glow"
                >
                  {isActive ? (
                    <Pause className="w-5 h-5 mr-2" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  {isActive ? 'Pause' : 'Start'}
                </Button>
                
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="lg"
                  className="px-8 border-forest-light hover:bg-forest-light"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-forest-light">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {completedSessions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sessions Today
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tree-bright">
                    {Math.floor(completedSessions / settings.sessionsUntilLongBreak)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cycles Complete
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Forest Growth Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ForestGrowth 
            completedSessions={completedSessions}
            isActive={isActive}
            currentSession={currentSession}
          />
        </motion.div>
      </div>

      {/* Background Music */}
      <BackgroundMusic 
        isTimerActive={isActive}
        timerDuration={getCurrentDuration()}
        timeLeft={timeLeft}
        resetCounter={resetCounter}
        isNewSession={isNewSession}
      />

      {/* Custom Sessions */}
      <CustomSessions 
        onSessionSelect={handleCustomSessionSelect}
        currentSettings={settings}
      />

      {/* Progress Calendar */}
      <ProgressCalendar 
        completedSessions={completedSessions}
        sessionHistory={sessionHistory}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <TimerSettings
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};