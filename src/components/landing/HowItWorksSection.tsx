import { motion } from 'framer-motion';
import { Play, Focus, TreePine, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Play,
    step: '01',
    title: 'Start Your Timer',
    description: 'Choose your focus duration and hit start. The classic Pomodoro is 25 minutes, but you can customize it to fit your workflow.',
  },
  {
    icon: Focus,
    step: '02',
    title: 'Stay Focused',
    description: 'Work on your task while your tree begins to grow. Ambient music helps you maintain concentration and enter the flow state.',
  },
  {
    icon: TreePine,
    step: '03',
    title: 'Complete Sessions',
    description: 'Finish your focus session to see your tree fully bloom. Each completed session adds a new tree to your growing forest.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Track Progress',
    description: 'Review your productivity calendar and watch your forest expand. Build streaks and celebrate your consistency.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How <span className="text-primary">PomodoroBuddy</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to transform your productivity and grow your digital forest.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-card border border-border rounded-2xl p-6 h-full relative z-10">
                  {/* Step number */}
                  <div className="absolute -top-4 left-6 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
