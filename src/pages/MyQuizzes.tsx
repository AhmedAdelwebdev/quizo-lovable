import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Plus, 
  Eye, 
  Users, 
  BarChart3, 
  Share2, 
  Trash2,
  Clock,
  Trophy,
  Calendar,
  Copy,
  Brain,
  User
} from 'lucide-react';
import { getQuizzes, getQuizResults, Quiz, QuizResult, saveQuiz } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

const MyQuizzes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const username = sessionStorage.getItem('quizo_username');
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }
    
    const allQuizzes = getQuizzes();
    const myQuizzes = allQuizzes.filter(quiz => quiz.createdBy === username);
    setUserQuizzes(myQuizzes);
  }, [username, navigate]);

  const loadQuizResults = (quiz: Quiz) => {
    const results = getQuizResults(quiz.id);
    setQuizResults(results);
    setSelectedQuiz(quiz);
  };

  const copyShareLink = (quiz: Quiz) => {
    const shareLink = `${window.location.origin}/quiz/${quiz.id}`;
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard.",
    });
  };

  const deleteQuiz = (quizId: string) => {
    const allQuizzes = getQuizzes();
    const updatedQuizzes = allQuizzes.filter(quiz => quiz.id !== quizId);
    localStorage.setItem('quizo_quizzes', JSON.stringify(updatedQuizzes));
    setUserQuizzes(updatedQuizzes.filter(quiz => quiz.createdBy === username));
    
    toast({
      title: "Quiz deleted",
      description: "Quiz has been successfully deleted.",
    });
  };

  const togglePublishStatus = (quiz: Quiz) => {
    const updatedQuiz = { ...quiz, isPublished: !quiz.isPublished };
    saveQuiz(updatedQuiz);
    
    const allQuizzes = getQuizzes();
    const myQuizzes = allQuizzes.filter(quiz => quiz.createdBy === username);
    setUserQuizzes(myQuizzes);
    
    toast({
      title: updatedQuiz.isPublished ? "Quiz published" : "Quiz unpublished",
      description: updatedQuiz.isPublished 
        ? "Your quiz is now available for others to take" 
        : "Your quiz is no longer public",
    });
  };

  if (!username) return null;

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
            <h1 className="text-xl font-bold text-gradient font-poppins">My Quizzes</h1>
          </div>
          <Button variant="hero" onClick={() => navigate('/create-quiz')}>
            <Plus className="w-4 h-4" />
            Create New Quiz
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="quizzes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quizzes">My Quizzes ({userQuizzes.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-6">
            {userQuizzes.length === 0 ? (
              <Card className="gradient-card border-card-border text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first quiz to get started!
                  </p>
                  <Button variant="hero" onClick={() => navigate('/create-quiz')}>
                    <Plus className="w-4 h-4" />
                    Create Your First Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userQuizzes.map(quiz => {
                  const results = getQuizResults(quiz.id);
                  const avgScore = results.length > 0 
                    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.totalQuestions), 0) / results.length * 100)
                    : 0;

                  return (
                    <Card key={quiz.id} className="gradient-card border-card-border hover:scale-105 transition-base">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                            {quiz.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">{quiz.difficulty}</Badge>
                        </div>
                        <CardTitle className="font-poppins">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {quiz.description}
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

                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => loadQuizResults(quiz)}
                          >
                            <BarChart3 className="w-3 h-3" />
                            Results
                          </Button>
                          
                          {quiz.isPublished && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyShareLink(quiz)}
                            >
                              <Share2 className="w-3 h-3" />
                              Share
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => togglePublishStatus(quiz)}
                          >
                            <Eye className="w-3 h-3" />
                            {quiz.isPublished ? "Unpublish" : "Publish"}
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
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {selectedQuiz ? (
              <div className="space-y-6">
                <Card className="gradient-card border-card-border">
                  <CardHeader>
                    <CardTitle className="font-poppins flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Quiz Analytics: {selectedQuiz.title}
                    </CardTitle>
                    <CardDescription>
                      Detailed performance metrics and participant results
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {quizResults.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No one has taken this quiz yet</p>
                      </div>
                    ) : (
                      <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-gradient">{quizResults.length}</p>
                            <p className="text-sm text-muted-foreground">Total Attempts</p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-success">
                              {Math.round(quizResults.reduce((sum, r) => sum + (r.score / r.totalQuestions), 0) / quizResults.length * 100)}%
                            </p>
                            <p className="text-sm text-muted-foreground">Avg Score</p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">
                              {Math.round(quizResults.reduce((sum, r) => sum + r.timeSpent, 0) / quizResults.length)}s
                            </p>
                            <p className="text-sm text-muted-foreground">Avg Time</p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-warning">
                              {Math.max(...quizResults.map(r => r.score))}
                            </p>
                            <p className="text-sm text-muted-foreground">Best Score</p>
                          </div>
                        </div>

                        {/* Recent Results */}
                        <div>
                          <h3 className="font-semibold mb-4">Recent Results</h3>
                          <div className="space-y-3">
                            {quizResults
                              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                              .slice(0, 10)
                              .map(result => (
                                <div key={result.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{result.participantName}</p>
                                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(result.completedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-2">
                                      <Trophy className="w-4 h-4 text-warning" />
                                      <span className="font-semibold">
                                        {result.score}/{result.totalQuestions}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        ({Math.round((result.score / result.totalQuestions) * 100)}%)
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {result.timeSpent}s
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="gradient-card border-card-border text-center py-12">
                <CardContent>
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Quiz</h3>
                  <p className="text-muted-foreground">
                    Choose a quiz from the "My Quizzes" tab to view its analytics
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyQuizzes;