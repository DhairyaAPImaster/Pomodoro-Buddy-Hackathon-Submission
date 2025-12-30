import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

const Landing = () => {
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PomodoroBuddy',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    description: 'A Pomodoro timer that grows a digital forest as you focus',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>PomodoroBuddy - Pomodoro Timer with Forest Growth Gamification | Focus App</title>
        <meta name="description" content="Boost your productivity with PomodoroBuddy - a beautiful Pomodoro timer that grows a digital forest as you complete focus sessions. Free productivity app with music, progress tracking, and gamification." />
        <meta name="keywords" content="pomodoro timer, focus app, productivity tool, forest timer, study timer, work timer, focus music, time management, gamified productivity" />
        <link rel="canonical" href="https://pomodorobuddy.app/" />
        <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
      </Helmet>

      <Navbar />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
