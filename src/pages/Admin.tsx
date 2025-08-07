import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Settings, 
  Trash2, 
  Eye,
  Calendar,
  Trophy,
  DollarSign,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { getQuizzes, getQuizResults, Quiz, QuizResult, getUserData, User } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [allResults, setAllResults] = useState<QuizResult[]>([]);
  const [userStats, setUserStats] = useState<any>({});

  useEffect(() => {
    // Check if already authenticated in session
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      loadData();
      toast({
        title: "Admin access granted",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Access denied",
        description: "Incorrect admin password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
    navigate('/');
  };

  const loadData = () => {
    // Load all quizzes
    const quizzes = getQuizzes();
    setAllQuizzes(quizzes);

    // Load all results
    const allResultsData: QuizResult[] = [];
    quizzes.forEach(quiz => {
      const results = getQuizResults(quiz.id);
      allResultsData.push(...results);
    });
    setAllResults(allResultsData);

    // Calculate user statistics
    const users = new Set(allResultsData.map(r => r.participantName));
    const quizCreators = new Set(quizzes.map(q => q.createdBy));
    
    const stats = {
      totalUsers: users.size,
      totalCreators: quizCreators.size,
      totalQuizzes: quizzes.length,
      publishedQuizzes: quizzes.filter(q => q.isPublished).length,
      totalAttempts: allResultsData.length,
      avgScore: allResultsData.length > 0 
        ? Math.round(allResultsData.reduce((sum, r) => sum + (r.score / r.totalQuestions), 0) / allResultsData.length * 100)
        : 0,
      todayQuizzes: quizzes.filter(q => 
        new Date(q.createdAt).toDateString() === new Date().toDateString()
      ).length,
      todayAttempts: allResultsData.filter(r => 
        new Date(r.completedAt).toDateString() === new Date().toDateString()
      ).length,
    };
    
    setUserStats(stats);
  };

  const deleteQuiz = (quizId: string) => {
    const updatedQuizzes = allQuizzes.filter(quiz => quiz.id !== quizId);
    localStorage.setItem('quizo_quizzes', JSON.stringify(updatedQuizzes));
    
    // Also remove results for this quiz
    const allStoredResults = JSON.parse(localStorage.getItem('quizo_quiz_results') || '[]');
    const updatedResults = allStoredResults.filter((result: QuizResult) => result.quizId !== quizId);
    localStorage.setItem('quizo_quiz_results', JSON.stringify(updatedResults));
    
    loadData();
    toast({
      title: "Quiz deleted",
      description: "Quiz and all its results have been removed",
    });
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL quiz data? This cannot be undone.')) {
      localStorage.removeItem('quizo_quizzes');
      localStorage.removeItem('quizo_quiz_results');
      
      // Clear user data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('quizo_user_')) {
          localStorage.removeItem(key);
        }
      });
      
      loadData();
      toast({
        title: "All data cleared",
        description: "All quizzes, results, and user data have been removed",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="font-poppins text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Enter the admin password to access the management panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleLogin}>
                Access Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-card-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gradient font-poppins">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Administrator</Badge>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes ({allQuizzes.length})</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="gradient-card border-card-border">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gradient">{userStats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              
              <Card className="gradient-card border-card-border">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gradient">{userStats.totalQuizzes}</p>
                  <p className="text-sm text-muted-foreground">Total Quizzes</p>
                </CardContent>
              </Card>
              
              <Card className="gradient-card border-card-border">
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gradient">{userStats.totalAttempts}</p>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </CardContent>
              </Card>
              
              <Card className="gradient-card border-card-border">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gradient">{userStats.avgScore}%</p>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Activity */}
            <Card className="gradient-card border-card-border">
              <CardHeader>
                <CardTitle className="font-poppins flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xl font-bold text-primary">{userStats.todayQuizzes}</p>
                    <p className="text-sm text-muted-foreground">Quizzes Created</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xl font-bold text-success">{userStats.todayAttempts}</p>
                    <p className="text-sm text-muted-foreground">Quiz Attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="gradient-card border-card-border">
              <CardHeader>
                <CardTitle className="font-poppins">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allResults
                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                    .slice(0, 5)
                    .map(result => {
                      const quiz = allQuizzes.find(q => q.id === result.quizId);
                      return (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{result.participantName}</p>
                            <p className="text-sm text-muted-foreground">
                              completed "{quiz?.title || 'Unknown Quiz'}"
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{result.score}/{result.totalQuestions}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(result.completedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allQuizzes.map(quiz => {
                const results = getQuizResults(quiz.id);
                const avgScore = results.length > 0 
                  ? Math.round(results.reduce((sum, r) => sum + (r.score / r.totalQuestions), 0) / results.length * 100)
                  : 0;

                return (
                  <Card key={quiz.id} className="gradient-card border-card-border">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                          {quiz.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">{quiz.difficulty}</Badge>
                      </div>
                      <CardTitle className="font-poppins text-lg">{quiz.title}</CardTitle>
                      <CardDescription>
                        Created by {quiz.createdBy} on {new Date(quiz.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <p className="font-semibold text-gradient">{quiz.questionCount}</p>
                          <p className="text-muted-foreground">Questions</p>
                        </div>
                        <div>
                          <p className="font-semibold">{results.length}</p>
                          <p className="text-muted-foreground">Attempts</p>
                        </div>
                        <div>
                          <p className="font-semibold text-success">{avgScore}%</p>
                          <p className="text-muted-foreground">Avg Score</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/quiz/${quiz.id}`)}
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteQuiz(quiz.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="gradient-card border-card-border">
              <CardHeader>
                <CardTitle className="font-poppins">User Statistics</CardTitle>
                <CardDescription>
                  Overview of user activity and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xl font-bold text-primary">{userStats.totalCreators}</p>
                    <p className="text-sm text-muted-foreground">Quiz Creators</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xl font-bold text-secondary">{userStats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Quiz Takers</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xl font-bold text-success">{userStats.publishedQuizzes}</p>
                    <p className="text-sm text-muted-foreground">Published Quizzes</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-xl font-bold text-warning">
                      {userStats.totalAttempts > 0 ? Math.round(userStats.totalAttempts / userStats.totalUsers) : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Attempts/User</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="gradient-card border-card-border">
              <CardHeader>
                <CardTitle className="font-poppins">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allResults
                    .reduce((acc: any[], result) => {
                      const existing = acc.find(item => item.name === result.participantName);
                      if (existing) {
                        existing.totalScore += result.score;
                        existing.totalQuestions += result.totalQuestions;
                        existing.attempts += 1;
                      } else {
                        acc.push({
                          name: result.participantName,
                          totalScore: result.score,
                          totalQuestions: result.totalQuestions,
                          attempts: 1
                        });
                      }
                      return acc;
                    }, [])
                    .sort((a, b) => (b.totalScore / b.totalQuestions) - (a.totalScore / a.totalQuestions))
                    .slice(0, 10)
                    .map((user, index) => (
                      <div key={user.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-warning' : index === 1 ? 'bg-muted' : index === 2 ? 'bg-destructive/70' : 'bg-primary'
                          }`}>
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.attempts} attempts</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {Math.round((user.totalScore / user.totalQuestions) * 100)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.totalScore}/{user.totalQuestions}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="gradient-card border-card-border">
              <CardHeader>
                <CardTitle className="font-poppins flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Management
                </CardTitle>
                <CardDescription>
                  Administrative tools and system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={clearAllData}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Quiz Data
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Storage Usage</h4>
                    <p className="text-sm text-muted-foreground">
                      Quizzes: {(JSON.stringify(allQuizzes).length / 1024).toFixed(2)} KB
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Results: {(JSON.stringify(allResults).length / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">System Status</h4>
                    <p className="text-sm text-success">✓ All systems operational</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;