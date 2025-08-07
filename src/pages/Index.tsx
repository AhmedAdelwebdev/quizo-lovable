import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, Trophy, Zap, ArrowRight, Star } from 'lucide-react';
import heroImage from '@/assets/hero-quiz.jpg';
import QuizCard from '@/components/QuizCard';

const Index = () => {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('quizo_username');

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'Smart Quiz Creation',
      description: 'Generate quizzes from multiple categories with AI-powered questions'
    },
    {
      icon: Users,
      title: 'Share & Challenge',
      description: 'Challenge friends and track their progress in real-time'
    },
    {
      icon: Trophy,
      title: 'Track Performance',
      description: 'Analyze results and improve your knowledge with detailed stats'
    },
    {
      icon: Zap,
      title: 'Multiple Difficulties',
      description: 'From easy learning to speed challenges - perfect for everyone'
    }
  ];

  const sampleQuizzes = [
    {
      id: '1',
      title: 'Science Fundamentals',
      description: 'Test your knowledge of basic scientific principles',
      difficulty: 'Easy',
      questionCount: 8,
      playCount: 156,
      avgScore: 78,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Movie Trivia Challenge',
      description: 'How well do you know cinema history?',
      difficulty: 'Medium',
      questionCount: 12,
      timeLimit: 60,
      playCount: 89,
      avgScore: 65,
      createdAt: '2024-01-14'
    },
    {
      id: '3',
      title: 'Speed Geography',
      description: 'Quick-fire geography questions',
      difficulty: 'Speed',
      questionCount: 5,
      timeLimit: 30,
      playCount: 203,
      avgScore: 72,
      createdAt: '2024-01-13'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-card-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient font-poppins">Quizo</h1>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/pricing')}>
                  Pricing
                </Button>
                <Button variant="default" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/pricing')}>
                  Pricing
                </Button>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="default" onClick={() => navigate('/login')}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h2 className="text-5xl lg:text-6xl font-bold font-poppins mb-6">
              Create Quizzes.{' '}
              <span className="text-gradient">Challenge Friends.</span>{' '}
              Learn & Laugh.
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Build interactive quizzes in minutes, share them with friends, and track your knowledge journey. 
              Perfect for learning, entertainment, and friendly competition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                onClick={handleGetStarted}
                className="animate-bounce-in"
              >
                Create Your Quiz
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate('/pricing')}>
                View Pricing
              </Button>
            </div>
          </div>
          <div className="animate-slide-up">
            <img 
              src={heroImage} 
              alt="People creating and taking quizzes" 
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold font-poppins mb-4">Why Choose Quizo?</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, share, and enjoy quizzes with friends and family
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="gradient-card border-card-border text-center animate-slide-up hover:scale-105 transition-base"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="mx-auto w-12 h-12 gradient-primary rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="font-poppins text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent Quizzes Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold font-poppins mb-4">Popular Quizzes</h3>
          <p className="text-lg text-muted-foreground">
            Try out these community favorites
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleQuizzes.map((quiz, index) => (
            <div 
              key={quiz.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <QuizCard 
                quiz={quiz} 
                onPlay={(id) => window.open(`/quiz/${id}`, '_blank')}
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white font-poppins mb-6">
            Ready to Start Your Quiz Journey?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of quiz creators and players. Create your first quiz in less than 2 minutes.
          </p>
          <Button 
            variant="secondary" 
            size="xl" 
            onClick={handleGetStarted}
            className="animate-bounce-in"
          >
            Get Started Now
            <Star className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Quizo. Built with ❤️ for quiz lovers everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
