import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  questionCount: number;
  categories: string[];
  timeLimit: number | null;
  createdAt: string;
  createdBy: string;
  questions?: Question[];
  isPublished: boolean;
  shareLink?: string;
  results?: QuizResult[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  timeLimit?: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  participantName: string;
  participantEmail?: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  answers: AnswerRecord[];
  completedAt: string;
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface User {
  email: string;
  username: string;
  quizzesToday: number;
  lastQuizDate: string;
  subscriptionType: 'free' | 'weekly' | 'monthly';
  subscriptionEnd?: string;
}

// Storage functions
export const getQuizzes = (): Quiz[] => {
  try {
    return JSON.parse(localStorage.getItem('quizo_quizzes') || '[]');
  } catch {
    return [];
  }
};

export const saveQuiz = (quiz: Quiz) => {
  const quizzes = getQuizzes();
  const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
  
  if (existingIndex >= 0) {
    quizzes[existingIndex] = quiz;
  } else {
    quizzes.push(quiz);
  }
  
  localStorage.setItem('quizo_quizzes', JSON.stringify(quizzes));
};

export const getQuizResults = (quizId: string): QuizResult[] => {
  try {
    const allResults = JSON.parse(localStorage.getItem('quizo_quiz_results') || '[]');
    return allResults.filter((result: QuizResult) => result.quizId === quizId);
  } catch {
    return [];
  }
};

export const saveQuizResult = (result: QuizResult) => {
  try {
    const allResults = JSON.parse(localStorage.getItem('quizo_quiz_results') || '[]');
    allResults.push(result);
    localStorage.setItem('quizo_quiz_results', JSON.stringify(allResults));
  } catch (error) {
    console.error('Error saving quiz result:', error);
  }
};

export const getUserData = (): User | null => {
  try {
    const username = sessionStorage.getItem('quizo_username');
    if (!username) return null;
    
    const userData = localStorage.getItem(`quizo_user_${username}`);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const saveUserData = (user: User) => {
  try {
    localStorage.setItem(`quizo_user_${user.username}`, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const canCreateQuiz = (): { canCreate: boolean; reason?: string } => {
  const user = getUserData();
  if (!user) return { canCreate: false, reason: 'User not logged in' };
  
  const today = new Date().toDateString();
  const lastQuizDate = new Date(user.lastQuizDate || '').toDateString();
  
  // Reset daily count if it's a new day
  if (lastQuizDate !== today) {
    user.quizzesToday = 0;
    user.lastQuizDate = today;
    saveUserData(user);
  }
  
  // Check subscription
  if (user.subscriptionType !== 'free') {
    const subscriptionEnd = new Date(user.subscriptionEnd || '');
    if (subscriptionEnd > new Date()) {
      return { canCreate: true };
    }
  }
  
  // Check daily limit for free users
  if (user.quizzesToday >= 3) {
    return { canCreate: false, reason: 'Daily limit reached. Upgrade to create more quizzes!' };
  }
  
  return { canCreate: true };
};

export const incrementQuizCount = () => {
  const user = getUserData();
  if (!user) return;
  
  const today = new Date().toDateString();
  if (user.lastQuizDate !== today) {
    user.quizzesToday = 1;
  } else {
    user.quizzesToday += 1;
  }
  
  user.lastQuizDate = today;
  saveUserData(user);
};