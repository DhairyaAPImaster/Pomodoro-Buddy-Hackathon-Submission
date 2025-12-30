import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Coffee, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface TimerSettingsProps {
  settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  };
  onSettingsChange: (settings: any) => void;
  onClose: () => void;
}

export const TimerSettings: React.FC<TimerSettingsProps> = ({
  settings,
  onSettingsChange,
  onClose
}) => {
  const updateSetting = (key: string, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="p-6 shadow-forest bg-gradient-forest border-forest-light">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Timer Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-forest-light"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Work Duration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <Label className="text-sm font-medium">Focus Duration</Label>
                <Badge variant="outline" className="ml-auto">
                  {settings.workDuration} min
                </Badge>
              </div>
              <Slider
                value={[settings.workDuration]}
                onValueChange={([value]) => updateSetting('workDuration', value)}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Short Break Duration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-tree-leaf" />
                <Label className="text-sm font-medium">Short Break</Label>
                <Badge variant="outline" className="ml-auto">
                  {settings.shortBreakDuration} min
                </Badge>
              </div>
              <Slider
                value={[settings.shortBreakDuration]}
                onValueChange={([value]) => updateSetting('shortBreakDuration', value)}
                min={1}
                max={15}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 min</span>
                <span>15 min</span>
              </div>
            </div>

            {/* Long Break Duration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pause className="w-4 h-4 text-tree-bright" />
                <Label className="text-sm font-medium">Long Break</Label>
                <Badge variant="outline" className="ml-auto">
                  {settings.longBreakDuration} min
                </Badge>
              </div>
              <Slider
                value={[settings.longBreakDuration]}
                onValueChange={([value]) => updateSetting('longBreakDuration', value)}
                min={10}
                max={45}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10 min</span>
                <span>45 min</span>
              </div>
            </div>

            {/* Sessions until long break */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <Label className="text-sm font-medium">Sessions Until Long Break</Label>
                <Badge variant="outline" className="ml-auto">
                  {settings.sessionsUntilLongBreak}
                </Badge>
              </div>
              <Slider
                value={[settings.sessionsUntilLongBreak]}
                onValueChange={([value]) => updateSetting('sessionsUntilLongBreak', value)}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2</span>
                <span>8</span>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-forest-dark p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Session Preview:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Focus for {settings.workDuration} minutes</div>
                <div>• Short break for {settings.shortBreakDuration} minutes</div>
                <div>• After {settings.sessionsUntilLongBreak} sessions: {settings.longBreakDuration} minute break</div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90 shadow-glow"
            >
              Save Settings
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};