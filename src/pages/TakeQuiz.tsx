import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, User, Trophy, Share2, ArrowLeft } from 'lucide-react';
import { getQuizzes, saveQuizResult, Quiz, Question, QuizResult, AnswerRecord } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (quizId) {
      const allQuizzes = getQuizzes();
      const foundQuiz = allQuizzes.find(q => q.id === quizId && q.isPublished);
      
      if (foundQuiz && foundQuiz.questions) {
        setQuiz(foundQuiz);
        if (foundQuiz.timeLimit) {
          setTimeLeft(foundQuiz.timeLimit);
        }
      } else {
        toast({
          title: "Quiz not found",
          description: "This quiz doesn't exist or is not published.",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [quizId, navigate, toast]);

  useEffect(() => {
    if (hasStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [hasStarted, timeLeft]);

  const startQuiz = () => {
    if (!participantName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to start the quiz.",
        variant: "destructive",
      });
      return;
    }
    
    setHasStarted(true);
    setQuestionStartTime(Date.now());
  };

  const handleTimeUp = () => {
    const timeSpent = Date.now() - questionStartTime;
    const answer: AnswerRecord = {
      questionId: quiz!.questions![currentQuestionIndex].id,
      selectedAnswer: selectedAnswer ?? -1,
      isCorrect: selectedAnswer === quiz!.questions![currentQuestionIndex].correctAnswer,
      timeSpent
    };
    
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < quiz!.questions!.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
      if (quiz!.timeLimit) {
        setTimeLeft(quiz!.timeLimit);
      }
    } else {
      finishQuiz(newAnswers);
    }
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) {
      toast({
        title: "Please select an answer",
        description: "Choose an option before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    handleTimeUp();
  };

  const finishQuiz = (finalAnswers: AnswerRecord[]) => {
    const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
    const totalTime = finalAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
    
    const result: QuizResult = {
      id: Date.now().toString(),
      quizId: quiz!.id,
      participantName,
      score: correctAnswers,
      totalQuestions: quiz!.questions!.length,
      timeSpent: Math.round(totalTime / 1000),
      answers: finalAnswers,
      completedAt: new Date().toISOString()
    };
    
    saveQuizResult(result);
    setQuizResult(result);
    setShowResults(true);
    
    toast({
      title: "Quiz completed!",
      description: `You scored ${correctAnswers}/${quiz!.questions!.length}`,
    });
  };

  const shareResults = async () => {
    const text = `I just completed "${quiz!.title}" and scored ${quizResult!.score}/${quizResult!.totalQuestions}! Try it yourself: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz!.title,
          text,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(text);
        toast({
          title: "Results copied!",
          description: "Quiz results copied to clipboard.",
        });
      }
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Results copied!",
        description: "Quiz results copied to clipboard.",
      });
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <p>Loading quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && quizResult) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-poppins mb-2">Quiz Completed!</h1>
            <p className="text-muted-foreground">Here are your results</p>
          </div>

          <Card className="gradient-card border-card-border">
            <CardHeader>
              <CardTitle className="font-poppins text-2xl text-center">{quiz.title}</CardTitle>
              <CardDescription className="text-center">
                Completed by {quizResult.participantName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gradient">{quizResult.score}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{quizResult.totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">
                    {Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{quizResult.timeSpent}s</p>
                  <p className="text-sm text-muted-foreground">Time</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold mb-3">Question Review</h3>
                {quiz.questions!.map((question, index) => {
                  const answer = quizResult.answers[index];
                  return (
                    <div key={question.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => {
                          let className = "p-2 rounded text-sm border ";
                          if (optIndex === question.correctAnswer) {
                            className += "border-success bg-success/10 text-success";
                          } else if (optIndex === answer.selectedAnswer && !answer.isCorrect) {
                            className += "border-destructive bg-destructive/10 text-destructive";
                          } else {
                            className += "border-border bg-background";
                          }
                          
                          return (
                            <div key={optIndex} className={className}>
                              {option}
                              {optIndex === question.correctAnswer && " ✓"}
                              {optIndex === answer.selectedAnswer && optIndex !== question.correctAnswer && " ✗"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="hero" className="flex-1" onClick={shareResults}>
                  <Share2 className="w-4 h-4" />
                  Share Results
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Take Another Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          <Card className="gradient-card border-card-border">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{quiz.difficulty}</Badge>
                <Badge variant="outline">{quiz.questionCount} questions</Badge>
                {quiz.timeLimit && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {quiz.timeLimit}s per question
                  </Badge>
                )}
              </div>
              <CardTitle className="font-poppins text-2xl">{quiz.title}</CardTitle>
              <CardDescription className="text-base">{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Categories</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {quiz.categories.map(category => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="participant-name">Your Name</Label>
                <Input
                  id="participant-name"
                  placeholder="Enter your name..."
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Quiz Instructions
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Answer all {quiz.questionCount} questions</li>
                  {quiz.timeLimit && <li>• You have {quiz.timeLimit} seconds per question</li>}
                  <li>• Your results will be saved automatically</li>
                  <li>• You can share your results after completion</li>
                </ul>
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={startQuiz}
              >
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions![currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions!.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {quiz.questions!.length}</p>
              <h1 className="text-xl font-bold font-poppins">{quiz.title}</h1>
            </div>
            {timeLeft !== null && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gradient">{timeLeft}</div>
                <div className="text-xs text-muted-foreground">seconds</div>
              </div>
            )}
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Question Card */}
        <Card className="gradient-card border-card-border">
          <CardHeader>
            <CardTitle className="font-poppins text-xl">
              {currentQuestion.question}
            </CardTitle>
            <CardDescription>
              Select one answer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-base ${
                    selectedAnswer === index
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedAnswer === index
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-full h-full bg-white rounded-full scale-50"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(prev => prev - 1);
                    setSelectedAnswer(null);
                  }
                }}
              >
                Previous
              </Button>
              <Button
                variant="hero"
                onClick={handleAnswer}
                disabled={selectedAnswer === null}
              >
                {currentQuestionIndex === quiz.questions!.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TakeQuiz;