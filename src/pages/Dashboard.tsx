import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, Zap, Trophy, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('quizo_username') || 'Quiz Master';

  const handleLogout = () => {
    sessionStorage.removeItem('quizo_username');
    navigate('/');
  };

  const difficultyLevels = [
    {
      id: 'easy',
      title: 'Easy',
      description: 'Perfect for beginners',
      icon: Brain,
      color: 'bg-success',
      questions: '5-10 questions',
      time: 'No time limit'
    },
    {
      id: 'medium',
      title: 'Medium',
      description: 'Balanced challenge',
      icon: Trophy,
      color: 'bg-warning',
      questions: '10-15 questions',
      time: '60s per question'
    },
    {
      id: 'speed',
      title: 'Speed',
      description: 'Quick fire rounds',
      icon: Zap,
      color: 'gradient-secondary',
      questions: '5 questions',
      time: '30s per question'
    },
    {
      id: 'hard',
      title: 'Hard',
      description: 'For quiz masters',
      icon: Clock,
      color: 'gradient-primary',
      questions: '15-20 questions',
      time: '45s per question'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-card-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient font-poppins">Quizo</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome back,</span>
            <span className="font-semibold">{username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold font-poppins mb-4">
            Choose Your Challenge Level
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a difficulty level and start creating your perfect quiz. 
            Each level offers unique challenges and question types.
          </p>
        </div>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {difficultyLevels.map((level, index) => {
            const IconComponent = level.icon;
            return (
              <Card 
                key={level.id} 
                className="gradient-card border-card-border hover:scale-105 transition-base cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 ${level.color} rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-base`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-poppins text-xl">{level.title}</CardTitle>
                  <CardDescription>{level.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-full justify-center">
                      {level.questions}
                    </Badge>
                    <Badge variant="outline" className="w-full justify-center">
                      {level.time}
                    </Badge>
                  </div>
                  <Button 
                    variant="quiz" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/create-quiz?difficulty=${level.id}`)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Quiz
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <div className="inline-flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/my-quizzes')}
            >
              My Quizzes
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/pricing')}
            >
              Pricing
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;