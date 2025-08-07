import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Settings, Shuffle, CheckCircle } from 'lucide-react';

const CreateQuiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const difficulty = searchParams.get('difficulty') || 'easy';
  
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    'Science', 'History', 'Geography', 'Sports', 'Movies', 'Music',
    'Literature', 'Technology', 'Food', 'Art', 'Politics', 'Nature'
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

  const handleGenerateQuiz = () => {
    if (!quizTitle.trim()) return;
    
    // Create quiz object and store in localStorage
    const quizId = Date.now().toString();
    const newQuiz = {
      id: quizId,
      title: quizTitle,
      description: quizDescription,
      difficulty,
      questionCount,
      categories: selectedCategories.length > 0 ? selectedCategories : ['Random'],
      timeLimit: currentSettings.timeLimit,
      createdAt: new Date().toISOString(),
      createdBy: sessionStorage.getItem('quizo_username')
    };
    
    // Store quiz
    const existingQuizzes = JSON.parse(localStorage.getItem('quizo_quizzes') || '[]');
    existingQuizzes.push(newQuiz);
    localStorage.setItem('quizo_quizzes', JSON.stringify(existingQuizzes));
    
    // Show preview
    setShowPreview(true);
  };

  const handlePublishQuiz = () => {
    navigate('/dashboard');
  };

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
                  Select categories for your questions (leave empty for random mix)
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
                  <p className="font-medium">{questionCount}</p>
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
                    {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Random mix'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full"
              onClick={handleGenerateQuiz}
              disabled={!quizTitle.trim()}
            >
              <Plus className="w-5 h-5" />
              Generate Quiz
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateQuiz;