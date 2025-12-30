import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is the Pomodoro Technique?',
    answer: 'The Pomodoro Technique is a time management method developed by Francesco Cirillo. It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. This technique helps improve focus, reduce mental fatigue, and increase productivity.',
  },
  {
    question: 'How does the forest growth work?',
    answer: 'Every time you complete a focus session without interruption, a tree grows in your digital forest. The longer and more consistent your focus sessions, the more your forest flourishes. If you abandon a session early, your tree withers. This visual gamification makes productivity rewarding and motivating.',
  },
  {
    question: 'Is PomodoroBuddy free to use?',
    answer: 'Yes! PomodoroBuddy is completely free to use. You can access all core features including the Pomodoro timer, forest growth visualization, background music, and progress tracking without any cost.',
  },
  {
    question: 'Can I customize my work and break intervals?',
    answer: 'Absolutely! While the classic Pomodoro technique uses 25-minute work sessions and 5-minute breaks, you can customize both durations to fit your personal workflow. Some users prefer longer deep work sessions, while others benefit from shorter, more frequent breaks.',
  },
  {
    question: 'What kind of background music is available?',
    answer: 'PomodoroBuddy offers a curated selection of ambient music and lo-fi beats perfect for focus sessions. The music is streamed from YouTube, giving you access to hours of concentration-enhancing audio. You can control playback and choose from different mood-based playlists.',
  },
  {
    question: 'Does PomodoroBuddy work offline?',
    answer: 'The core timer functionality works offline, but some features like background music streaming and cloud sync require an internet connection. Your progress is saved locally and synced when you reconnect.',
  },
];

export const FAQSection = () => {
  // Generate FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4">
        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about PomodoroBuddy and the Pomodoro Technique.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
