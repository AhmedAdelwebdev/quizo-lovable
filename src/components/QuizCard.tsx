import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Play, Trash2 } from 'lucide-react';

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    questionCount: number;
    timeLimit?: number;
    playCount: number;
    avgScore: number;
    createdAt: string;
  };
  onPlay?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onPlay, onDelete, showActions = false }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'speed': return 'bg-secondary';
      case 'hard': return 'bg-primary';
      default: return 'bg-primary';
    }
  };

  return (
    <Card className="gradient-card border-card-border hover:scale-105 transition-base group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={`${getDifficultyColor(quiz.difficulty)} text-white`}
              >
                {quiz.difficulty}
              </Badge>
              <Badge variant="outline">
                {quiz.questionCount} questions
              </Badge>
            </div>
            <CardTitle className="font-poppins text-lg mb-1">{quiz.title}</CardTitle>
            <CardDescription className="text-sm">{quiz.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{quiz.playCount} plays</span>
          </div>
          {quiz.timeLimit && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{quiz.timeLimit}s/q</span>
            </div>
          )}
          <div className="text-success">
            Avg: {quiz.avgScore}%
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onPlay?.(quiz.id)}
          >
            <Play className="w-4 h-4" />
            Play Quiz
          </Button>
          {showActions && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete?.(quiz.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCard;