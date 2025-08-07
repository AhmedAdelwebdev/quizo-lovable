import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Crown, Zap, Star, DollarSign } from 'lucide-react';
import { getUserData, saveUserData, User, canCreateQuiz } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [quizLimit, setQuizLimit] = useState<{ canCreate: boolean; reason?: string }>({ canCreate: true, reason: '' });

  useEffect(() => {
    const username = sessionStorage.getItem('quizo_username');
    if (!username) {
      navigate('/login');
      return;
    }

    const userData = getUserData();
    if (userData) {
      setUser(userData);
    } else {
      // Create default user data
      const newUser: User = {
        email: `${username}@quizo.app`,
        username,
        quizzesToday: 0,
        lastQuizDate: new Date().toDateString(),
        subscriptionType: 'free'
      };
      saveUserData(newUser);
      setUser(newUser);
    }

    const limitCheck = canCreateQuiz();
    setQuizLimit(limitCheck);
  }, [navigate]);

  const handleOneTimePayment = async () => {
    if (!user) return;

    // Simulate payment process
    const confirmed = window.confirm('Pay $2 to create unlimited quizzes today?');
    if (!confirmed) return;

    // Reset daily count for today
    const updatedUser = {
      ...user,
      quizzesToday: 0,
      lastQuizDate: new Date().toDateString()
    };
    
    saveUserData(updatedUser);
    setUser(updatedUser);
    
    toast({
      title: "Payment successful!",
      description: "You can now create unlimited quizzes today.",
    });

    // Redirect to create quiz
    navigate('/create-quiz');
  };

  const handleSubscription = async (type: 'weekly' | 'monthly') => {
    if (!user) return;

    const price = type === 'weekly' ? '$5/week' : '$15/month';
    const confirmed = window.confirm(`Subscribe to ${type} plan for ${price}?`);
    if (!confirmed) return;

    // Calculate subscription end date
    const endDate = new Date();
    if (type === 'weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const updatedUser = {
      ...user,
      subscriptionType: type,
      subscriptionEnd: endDate.toISOString(),
      quizzesToday: 0
    };
    
    saveUserData(updatedUser);
    setUser(updatedUser);
    
    toast({
      title: "Subscription activated!",
      description: `Your ${type} plan is now active. Create unlimited quizzes!`,
    });

    // Redirect to create quiz
    navigate('/create-quiz');
  };

  const isSubscriptionActive = () => {
    if (!user || user.subscriptionType === 'free') return false;
    if (!user.subscriptionEnd) return false;
    return new Date(user.subscriptionEnd) > new Date();
  };

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: Star,
      features: [
        '3 quizzes per day',
        'Basic quiz templates',
        'Share with friends',
        'View results',
        'Community support'
      ],
      limitations: [
        'Limited to 3 quizzes daily',
        'Basic analytics only'
      ],
      current: user?.subscriptionType === 'free' || !isSubscriptionActive()
    },
    {
      id: 'weekly',
      name: 'Weekly Pro',
      price: '$5',
      period: 'per week',
      description: 'Great for frequent quiz creators',
      icon: Zap,
      features: [
        'Unlimited quizzes',
        'Advanced analytics',
        'Custom categories',
        'Priority support',
        'Export results',
        'Custom branding'
      ],
      popular: true,
      current: user?.subscriptionType === 'weekly' && isSubscriptionActive()
    },
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: '$15',
      period: 'per month',
      description: 'Best value for power users',
      icon: Crown,
      features: [
        'Unlimited quizzes',
        'Advanced analytics',
        'Custom categories',
        'Priority support',
        'Export results',
        'Custom branding',
        'API access',
        'White label options'
      ],
      bestValue: true,
      current: user?.subscriptionType === 'monthly' && isSubscriptionActive()
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-card-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gradient font-poppins">Pricing Plans</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Welcome, {user.username}</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Current Status */}
        {!quizLimit.canCreate && (
          <Card className="gradient-card border-card-border mb-8 bg-warning/10 border-warning/20">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-12 h-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Daily Limit Reached</h2>
              <p className="text-muted-foreground mb-4">{quizLimit.reason}</p>
              <div className="flex gap-4 justify-center">
                <Button variant="hero" onClick={handleOneTimePayment}>
                  Pay $2 for Today
                </Button>
                <Button variant="outline" onClick={() => navigate('/pricing')}>
                  View Subscriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-poppins mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with 3 free quizzes daily, or upgrade for unlimited quiz creation and advanced features
          </p>
        </div>

        {/* Quick Payment Option */}
        {user.subscriptionType === 'free' && !quizLimit.canCreate && (
          <Card className="gradient-card border-card-border mb-8">
            <CardHeader className="text-center">
              <CardTitle className="font-poppins flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Quick Solution
              </CardTitle>
              <CardDescription>
                Need to create a quiz right now? Get instant access for today only
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-muted/50 p-6 rounded-lg mb-4">
                <p className="text-3xl font-bold text-gradient mb-2">$2</p>
                <p className="text-muted-foreground">Unlimited quizzes for today</p>
              </div>
              <Button variant="hero" size="lg" onClick={handleOneTimePayment}>
                Pay $2 & Create Quiz Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map(plan => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`gradient-card border-card-border relative ${
                  plan.current ? 'ring-2 ring-primary' : ''
                } ${plan.popular || plan.bestValue ? 'transform scale-105' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary">
                    Most Popular
                  </Badge>
                )}
                {plan.bestValue && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-success">
                    Best Value
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 gradient-primary rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-poppins text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gradient">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations && (
                    <div className="pt-4 border-t border-card-border">
                      <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                      {plan.limitations.map((limitation, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          • {limitation}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="pt-4">
                    {plan.current ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : plan.id === 'free' ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/dashboard')}
                      >
                        Continue with Free
                      </Button>
                    ) : (
                      <Button 
                        variant={plan.popular || plan.bestValue ? "hero" : "default"}
                        className="w-full"
                        onClick={() => handleSubscription(plan.id as 'weekly' | 'monthly')}
                      >
                        Subscribe Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Usage Status */}
        <Card className="gradient-card border-card-border">
          <CardHeader>
            <CardTitle className="font-poppins">Your Current Usage</CardTitle>
            <CardDescription>
              Track your quiz creation activity and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-gradient">{user.quizzesToday}</p>
                <p className="text-sm text-muted-foreground">Quizzes Created Today</p>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold capitalize">{user.subscriptionType}</p>
                <p className="text-sm text-muted-foreground">Current Plan</p>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">
                  {user.subscriptionType === 'free' ? (3 - user.quizzesToday) : '∞'}
                </p>
                <p className="text-sm text-muted-foreground">Remaining Today</p>
              </div>
            </div>

            {isSubscriptionActive() && (
              <div className="text-center p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-success font-medium">
                  ✓ Your {user.subscriptionType} subscription is active until{' '}
                  {new Date(user.subscriptionEnd!).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Pricing;