import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Settings, Shuffle, CheckCircle, Edit, Save, Trash2, DollarSign } from 'lucide-react';
import { canCreateQuiz, incrementQuizCount, saveQuiz, Quiz, Question } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

const CreateQuiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const difficulty = searchParams.get('difficulty') || 'easy';
  
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: 'General'
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [canCreate, setCanCreate] = useState<{ canCreate: boolean; reason?: string }>({ canCreate: true, reason: '' });

  useEffect(() => {
    const username = sessionStorage.getItem('quizo_username');
    if (!username) {
      navigate('/login');
      return;
    }
    
    const limitCheck = canCreateQuiz();
    setCanCreate(limitCheck);
  }, [navigate]);

  const categories = [
    'Science', 'History', 'Geography', 'Sports', 'Movies', 'Music',
    'Literature', 'Technology', 'Food', 'Art', 'Politics', 'Nature', 'General'
  ];

  const difficultySettings = {
    easy: { maxQuestions: 10, timeLimit: null, color: 'bg-success' },
    medium: { maxQuestions: 15, timeLimit: 60, color: 'bg-warning' },
    speed: { maxQuestions: 5, timeLimit: 30, color: 'bg-secondary' },
    hard: { maxQuestions: 20, timeLimit: 45, color: 'bg-primary' }
  };

  const currentSettings = difficultySettings[difficulty as keyof typeof difficultySettings];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleNextStep = () => {
    if (!quizTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a quiz title to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!canCreate.canCreate) {
      navigate('/pricing');
      return;
    }
    
    setShowQuestionBuilder(true);
  };

  const addNewQuestion = () => {
    setCurrentQuestion({
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      category: selectedCategories[0] || 'General'
    });
    setEditingIndex(null);
  };

  const saveQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question.",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestion.options.some(option => !option.trim())) {
      toast({
        title: "All options required",
        description: "Please fill in all answer options.",
        variant: "destructive",
      });
      return;
    }

    const questionWithId = {
      ...currentQuestion,
      id: currentQuestion.id || Date.now().toString()
    };

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = questionWithId;
      setQuestions(updatedQuestions);
    } else {
      setQuestions([...questions, questionWithId]);
    }

    setCurrentQuestion({
      id: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      category: selectedCategories[0] || 'General'
    });
    setEditingIndex(null);

    toast({
      title: "Question saved",
      description: "Question has been added to your quiz.",
    });
  };

  const editQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    toast({
      title: "Question deleted",
      description: "Question has been removed from your quiz.",
    });
  };

  const handleGenerateQuiz = () => {
    if (questions.length === 0) {
      toast({
        title: "No questions",
        description: "Please add at least one question to your quiz.",
        variant: "destructive",
      });
      return;
    }

    // Create quiz object and store in localStorage
    const quizId = Date.now().toString();
    const newQuiz: Quiz = {
      id: quizId,
      title: quizTitle,
      description: quizDescription,
      difficulty,
      questionCount: questions.length,
      categories: selectedCategories.length > 0 ? selectedCategories : ['General'],
      timeLimit: currentSettings.timeLimit,
      createdAt: new Date().toISOString(),
      createdBy: sessionStorage.getItem('quizo_username') || '',
      questions,
      isPublished: false
    };
    
    saveQuiz(newQuiz);
    incrementQuizCount();
    
    // Show preview
    setShowPreview(true);

    toast({
      title: "Quiz created!",
      description: "Your quiz has been successfully created.",
    });
  };

  const handlePublishQuiz = () => {
    navigate('/my-quizzes');
  };

  // Check if user can create quiz
  if (!canCreate.canCreate) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="gradient-card border-card-border bg-warning/10 border-warning/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="font-poppins text-2xl">Upgrade Required</CardTitle>
              <CardDescription className="text-base">{canCreate.reason}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
                <Button variant="hero" className="flex-1" onClick={() => navigate('/pricing')}>
                  View Pricing Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-poppins mb-2">Quiz Created Successfully!</h1>
            <p className="text-muted-foreground">Your quiz is ready to be shared with the world</p>
          </div>

          <Card className="gradient-card border-card-border animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${currentSettings.color} text-white`}>
                  {difficulty}
                </Badge>
                <Badge variant="outline">
                  {questionCount} questions
                </Badge>
                {currentSettings.timeLimit && (
                  <Badge variant="outline">
                    {currentSettings.timeLimit}s per question
                  </Badge>
                )}
              </div>
              <CardTitle className="font-poppins text-2xl">{quizTitle}</CardTitle>
              <CardDescription className="text-base">{quizDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(selectedCategories.length > 0 ? selectedCategories : ['Random']).map(category => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="flex-1"
                    onClick={handlePublishQuiz}
                  >
                    Publish Quiz
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowPreview(false)}
                  >
                    Edit Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
            <h1 className="text-xl font-bold text-gradient font-poppins">Create Quiz</h1>
          </div>
          <Badge className={`${currentSettings.color} text-white`}>
            {difficulty}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="gradient-card border-card-border animate-fade-in">
              <CardHeader>
                <CardTitle className="font-poppins flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quiz Details
                </CardTitle>
                <CardDescription>
                  Set up the basic information for your quiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter an engaging quiz title..."
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your quiz is about..."
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="questions">Number of Questions</Label>
                  <Input
                    id="questions"
                    type="number"
                    min="1"
                    max={currentSettings.maxQuestions}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Math.min(parseInt(e.target.value) || 1, currentSettings.maxQuestions))}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Max {currentSettings.maxQuestions} questions for {difficulty} difficulty
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="gradient-card border-card-border animate-slide-up">
              <CardHeader>
                <CardTitle className="font-poppins flex items-center gap-2">
                  <Shuffle className="w-5 h-5" />
                  Categories
                </CardTitle>
                <CardDescription>
                  Select categories for your questions (leave empty for general mix)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategories.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCategory(category)}
                      className="justify-start"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-card-border">
                    <p className="text-sm text-muted-foreground mb-2">Selected categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map(category => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question Builder */}
            {showQuestionBuilder && (
              <>
                <Card className="gradient-card border-card-border">
                  <CardHeader>
                    <CardTitle className="font-poppins flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
                    </CardTitle>
                    <CardDescription>
                      Create questions for your quiz with multiple choice answers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        placeholder="Enter your question..."
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={currentQuestion.category} 
                        onValueChange={(value) => setCurrentQuestion({...currentQuestion, category: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Answer Options</Label>
                      <div className="space-y-2 mt-1">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCurrentQuestion({
                                ...currentQuestion, 
                                correctAnswer: index
                              })}
                              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                                currentQuestion.correctAnswer === index
                                  ? 'border-success bg-success'
                                  : 'border-border'
                              }`}
                            >
                              {currentQuestion.correctAnswer === index && (
                                <div className="w-full h-full bg-white rounded-full scale-50"></div>
                              )}
                            </button>
                            <Input
                              placeholder={`Option ${index + 1}...`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options];
                                newOptions[index] = e.target.value;
                                setCurrentQuestion({...currentQuestion, options: newOptions});
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click the circle to mark the correct answer
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="hero" onClick={saveQuestion}>
                        <Save className="w-4 h-4" />
                        {editingIndex !== null ? 'Update Question' : 'Save Question'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCurrentQuestion({
                            id: '',
                            question: '',
                            options: ['', '', '', ''],
                            correctAnswer: 0,
                            category: selectedCategories[0] || 'General'
                          });
                          setEditingIndex(null);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions List */}
                {questions.length > 0 && (
                  <Card className="gradient-card border-card-border">
                    <CardHeader>
                      <CardTitle className="font-poppins">
                        Quiz Questions ({questions.length})
                      </CardTitle>
                      <CardDescription>
                        Review and manage your quiz questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {questions.map((question, index) => (
                          <div key={question.id} className="p-4 border border-card-border rounded-lg">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">Q{index + 1}</Badge>
                                  <Badge variant="secondary">{question.category}</Badge>
                                </div>
                                <p className="font-medium mb-2">{question.question}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                                  {question.options.map((option, optIndex) => (
                                    <div 
                                      key={optIndex} 
                                      className={`p-2 rounded ${
                                        optIndex === question.correctAnswer 
                                          ? 'bg-success/10 text-success border border-success/20' 
                                          : 'bg-muted/50'
                                      }`}
                                    >
                                      {optIndex === question.correctAnswer && '✓ '}{option}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => editQuestion(index)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => deleteQuestion(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-card-border">
                        <Button variant="outline" onClick={addNewQuestion} className="w-full">
                          <Plus className="w-4 h-4" />
                          Add Another Question
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quiz Preview */}
            <Card className="gradient-card border-card-border animate-slide-up">
              <CardHeader>
                <CardTitle className="font-poppins text-lg">Quiz Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{quizTitle || 'Untitled Quiz'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-medium">{showQuestionBuilder ? questions.length : questionCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <Badge className={`${currentSettings.color} text-white`}>
                    {difficulty}
                  </Badge>
                </div>
                {currentSettings.timeLimit && (
                  <div>
                    <p className="text-sm text-muted-foreground">Time Limit</p>
                    <p className="font-medium">{currentSettings.timeLimit}s per question</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="font-medium">
                    {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'General mix'}
                  </p>
                </div>
                {showQuestionBuilder && (
                  <div>
                    <p className="text-sm text-muted-foreground">Questions Added</p>
                    <p className="font-medium">{questions.length}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
                {!showQuestionBuilder ? (
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={handleNextStep}
                    disabled={!quizTitle.trim()}
                  >
                    <Plus className="w-5 h-5" />
                    Continue to Questions
                  </Button>
                ) : (
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={handleGenerateQuiz}
                    disabled={questions.length === 0}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Create Quiz ({questions.length} questions)
                  </Button>
                )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateQuiz;