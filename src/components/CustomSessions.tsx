import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Clock, Target, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

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

interface CustomSessionsProps {
  onSessionSelect: (session: CustomSession) => void;
  currentSettings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  };
}

const sessionColors = [
  'hsl(var(--primary))',
  'hsl(var(--tree-bright))',
  'hsl(var(--accent))',
  'hsl(15 70% 55%)', // Orange
  'hsl(270 60% 60%)', // Purple
  'hsl(200 70% 55%)', // Blue
];

const presetSessions: CustomSession[] = [
  {
    id: 'classic',
    name: 'Classic Pomodoro',
    description: 'Traditional 25/5/15 minute intervals',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    totalSessions: 8,
    color: sessionColors[0]
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Longer sessions for complex tasks',
    workDuration: 45,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    sessionsUntilLongBreak: 3,
    totalSessions: 6,
    color: sessionColors[1]
  },
  {
    id: 'quick-sprints',
    name: 'Quick Sprints',
    description: 'Short bursts for quick tasks',
    workDuration: 15,
    shortBreakDuration: 3,
    longBreakDuration: 10,
    sessionsUntilLongBreak: 6,
    totalSessions: 12,
    color: sessionColors[2]
  }
];

export const CustomSessions: React.FC<CustomSessionsProps> = ({
  onSessionSelect,
  currentSettings
}) => {
  const [customSessions, setCustomSessions] = useState<CustomSession[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSession, setEditingSession] = useState<CustomSession | null>(null);
  
  const [newSession, setNewSession] = useState<Partial<CustomSession>>({
    name: '',
    description: '',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    totalSessions: 8,
    color: sessionColors[0]
  });

  const allSessions = [...presetSessions, ...customSessions];

  const handleCreateSession = () => {
    if (!newSession.name) return;

    const session: CustomSession = {
      id: Date.now().toString(),
      name: newSession.name,
      description: newSession.description,
      workDuration: newSession.workDuration || 25,
      shortBreakDuration: newSession.shortBreakDuration || 5,
      longBreakDuration: newSession.longBreakDuration || 15,
      sessionsUntilLongBreak: newSession.sessionsUntilLongBreak || 4,
      totalSessions: newSession.totalSessions || 8,
      color: newSession.color || sessionColors[0]
    };

    if (editingSession) {
      setCustomSessions(prev => 
        prev.map(s => s.id === editingSession.id ? session : s)
      );
      setEditingSession(null);
    } else {
      setCustomSessions(prev => [...prev, session]);
    }

    resetForm();
  };

  const handleEditSession = (session: CustomSession) => {
    if (presetSessions.find(p => p.id === session.id)) return; // Can't edit presets
    
    setNewSession(session);
    setEditingSession(session);
    setShowCreateForm(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    setCustomSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const resetForm = () => {
    setNewSession({
      name: '',
      description: '',
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      totalSessions: 8,
      color: sessionColors[0]
    });
    setShowCreateForm(false);
    setEditingSession(null);
  };

  const isCurrentSession = (session: CustomSession) => {
    return session.workDuration === currentSettings.workDuration &&
           session.shortBreakDuration === currentSettings.shortBreakDuration &&
           session.longBreakDuration === currentSettings.longBreakDuration &&
           session.sessionsUntilLongBreak === currentSettings.sessionsUntilLongBreak;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full space-y-6"
    >
      <Card className="p-6 shadow-forest bg-gradient-forest border-forest-light">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-tree-bright" />
              Custom Sessions
            </h3>
            <Button
              onClick={() => setShowCreateForm(true)}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </div>

          {/* Session Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allSessions.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${isCurrentSession(session) 
                    ? 'border-primary bg-primary/10' 
                    : 'border-forest-light bg-forest-dark hover:border-primary/50'
                  }
                `}
                onClick={() => onSessionSelect(session)}
              >
                {/* Color indicator */}
                <div 
                  className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-background shadow-lg"
                  style={{ 
                    backgroundColor: session.color,
                    boxShadow: `0 0 10px ${session.color}40`
                  }}
                />

                {/* Session Info */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">{session.name}</h4>
                    {session.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.description}
                      </p>
                    )}
                  </div>

                  {/* Timing details */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Work:</span>
                      <span>{session.workDuration}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Break:</span>
                      <span>{session.shortBreakDuration}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Long Break:</span>
                      <span>{session.longBreakDuration}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cycle:</span>
                      <span>{session.sessionsUntilLongBreak} sessions</span>
                    </div>
                  </div>

                  {/* Total time estimate */}
                  <div className="pt-2 border-t border-forest-light">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Est. Total:</span>
                      <span className="text-tree-bright">
                        {(() => {
                          // Calculate total minutes for all sessions in the cycle
                          const totalWorkMinutes = session.workDuration * session.totalSessions;
                          const longBreaks = Math.floor(session.totalSessions / session.sessionsUntilLongBreak);
                          const shortBreaks = session.totalSessions - longBreaks;
                          const totalBreakMinutes = (shortBreaks * session.shortBreakDuration) + (longBreaks * session.longBreakDuration);
                          const totalMinutes = totalWorkMinutes + totalBreakMinutes;
                          return Math.round(totalMinutes / 60 * 10) / 10;
                        })()}h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current session indicator */}
                {isCurrentSession(session) && (
                  <Badge 
                    variant="outline" 
                    className="absolute -top-2 -left-2 border-primary text-primary text-xs"
                  >
                    Active
                  </Badge>
                )}

                {/* Custom session actions */}
                {!presetSessions.find(p => p.id === session.id) && (
                  <div className="absolute top-2 left-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSession(session);
                      }}
                      className="w-5 h-5 rounded bg-forest-medium hover:bg-forest-light flex items-center justify-center"
                    >
                      <Clock className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="w-5 h-5 rounded bg-destructive/20 hover:bg-destructive/30 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-forest-light pt-6"
            >
              <div className="space-y-4">
                <h4 className="font-medium">
                  {editingSession ? 'Edit Session' : 'Create New Session'}
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-name">Session Name</Label>
                    <Input
                      id="session-name"
                      value={newSession.name || ''}
                      onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Custom Session"
                      className="bg-forest-dark border-forest-light"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      {sessionColors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setNewSession(prev => ({ ...prev, color }))}
                          className={`
                            w-8 h-8 rounded-full border-2 transition-all
                            ${newSession.color === color ? 'border-foreground scale-110' : 'border-transparent'}
                          `}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-description">Description (Optional)</Label>
                  <Textarea
                    id="session-description"
                    value={newSession.description || ''}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this session type..."
                    className="bg-forest-dark border-forest-light resize-none"
                    rows={2}
                  />
                </div>

                {/* Duration Sliders */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Work Duration: {newSession.workDuration}m</Label>
                    <Slider
                      value={[newSession.workDuration || 25]}
                      onValueChange={([value]) => setNewSession(prev => ({ ...prev, workDuration: value }))}
                      min={5}
                      max={120}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Short Break: {newSession.shortBreakDuration}m</Label>
                    <Slider
                      value={[newSession.shortBreakDuration || 5]}
                      onValueChange={([value]) => setNewSession(prev => ({ ...prev, shortBreakDuration: value }))}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Long Break: {newSession.longBreakDuration}m</Label>
                    <Slider
                      value={[newSession.longBreakDuration || 15]}
                      onValueChange={([value]) => setNewSession(prev => ({ ...prev, longBreakDuration: value }))}
                      min={10}
                      max={60}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sessions Until Long Break: {newSession.sessionsUntilLongBreak}</Label>
                    <Slider
                      value={[newSession.sessionsUntilLongBreak || 4]}
                      onValueChange={([value]) => setNewSession(prev => ({ ...prev, sessionsUntilLongBreak: value }))}
                      min={2}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateSession}
                    disabled={!newSession.name}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingSession ? 'Update Session' : 'Create Session'}
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="border-forest-light"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};