import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp } from 'lucide-react';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface ProgressCalendarProps {
  completedSessions: number;
  sessionHistory: Array<{
    date: Date;
    sessions: number;
    totalFocusTime: number;
  }>;
}

export const ProgressCalendar: React.FC<ProgressCalendarProps> = ({
  completedSessions,
  sessionHistory
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get sessions for selected date
  const getSessionsForDate = (date: Date) => {
    return sessionHistory.find(session => 
      isSameDay(session.date, date)
    );
  };

  // Get week stats
  const getWeekStats = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weekSessions = weekDays.reduce((total, day) => {
      const dayData = getSessionsForDate(day);
      return total + (dayData?.sessions || 0);
    }, 0);

    const weekFocusTime = weekDays.reduce((total, day) => {
      const dayData = getSessionsForDate(day);
      return total + (dayData?.totalFocusTime || 0);
    }, 0);

    return { weekSessions, weekFocusTime };
  };

  const { weekSessions, weekFocusTime } = getWeekStats();
  const selectedDayData = selectedDate ? getSessionsForDate(selectedDate) : null;

  // Custom day cell renderer for calendar
  const renderDay = (day: Date) => {
    const dayData = getSessionsForDate(day);
    const sessions = dayData?.sessions || 0;
    const isToday = isSameDay(day, new Date());
    
    let intensityClass = '';
    if (sessions > 0) {
      if (sessions >= 8) intensityClass = 'bg-primary/80';
      else if (sessions >= 4) intensityClass = 'bg-primary/60';
      else if (sessions >= 2) intensityClass = 'bg-primary/40';
      else intensityClass = 'bg-primary/20';
    }

    return (
      <div className={`
        relative w-full h-full flex items-center justify-center
        ${intensityClass}
        ${isToday ? 'ring-2 ring-tree-bright' : ''}
        transition-colors duration-200
      `}>
        {day.getDate()}
        {sessions > 0 && (
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-tree-bright rounded-full" />
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full space-y-6"
    >
      <Card className="p-6 shadow-forest bg-gradient-forest border-forest-light">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-tree-bright" />
              Progress Calendar
            </h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-primary text-primary">
                Today: {getSessionsForDate(new Date())?.sessions || 0}
              </Badge>
              <Badge variant="outline" className="border-tree-bright text-tree-bright">
                This Week: {weekSessions}
              </Badge>
            </div>
          </div>

          {/* Calendar and Stats Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-forest-light p-3 pointer-events-auto"
                modifiers={{
                  hasData: (date) => Boolean(getSessionsForDate(date))
                }}
                modifiersStyles={{
                  hasData: { fontWeight: 'bold' }
                }}
                components={{
                  Day: ({ date, ...props }) => (
                    <div {...props} className="relative">
                      {renderDay(date)}
                    </div>
                  )
                }}
              />
              
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Intensity:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/20 rounded"></div>
                  <span>1-2</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/40 rounded"></div>
                  <span>3-4</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/60 rounded"></div>
                  <span>5-7</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/80 rounded"></div>
                  <span>8+</span>
                </div>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="space-y-4">
              {/* Selected Day Stats */}
              {selectedDate && (
                <div className="bg-forest-dark p-4 rounded-lg space-y-3">
                  <h4 className="font-medium text-sm">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </h4>
                  {selectedDayData ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sessions:</span>
                        <span className="text-primary font-medium">
                          {selectedDayData.sessions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Focus Time:</span>
                        <span className="text-tree-bright font-medium">
                          {Math.round(selectedDayData.totalFocusTime / 60)}m
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No sessions</p>
                  )}
                </div>
              )}

              {/* Week Summary */}
              <div className="bg-forest-dark p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  This Week
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sessions:</span>
                    <span className="text-primary font-medium">{weekSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Focus Hours:</span>
                    <span className="text-tree-bright font-medium">
                      {(weekFocusTime / 3600).toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Average:</span>
                    <span className="text-accent font-medium">
                      {(weekSessions / 7).toFixed(1)} sessions
                    </span>
                  </div>
                </div>
              </div>

              {/* All Time Stats */}
              <div className="bg-forest-dark p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-sm">All Time</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sessions:</span>
                    <span className="text-primary font-medium">{completedSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Days:</span>
                    <span className="text-tree-bright font-medium">
                      {sessionHistory.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};