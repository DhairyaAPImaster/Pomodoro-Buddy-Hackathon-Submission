import { motion } from 'framer-motion';
import { Timer, TreePine, Music, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Timer,
    title: 'Pomodoro Timer',
    description: 'Customizable work and break intervals using the proven Pomodoro Technique. Set your perfect focus rhythm with 25/5 or custom durations.',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: TreePine,
    title: 'Forest Growth',
    description: 'Watch your digital forest grow with every completed session. Visual gamification that makes productivity rewarding and fun.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Music,
    title: 'Background Music',
    description: 'Ambient sounds and lo-fi music to enhance your focus. Curated playlists that help you enter the flow state effortlessly.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Calendar,
    title: 'Progress Tracking',
    description: 'Calendar view of your productivity journey. Track your focus sessions, build streaks, and visualize your growth over time.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to{' '}
            <span className="text-primary">Stay Focused</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            PomodoroBuddy combines the proven Pomodoro Technique with gamification 
            to make productivity enjoyable and sustainable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border bg-card">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
