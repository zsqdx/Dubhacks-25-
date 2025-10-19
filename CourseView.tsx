import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ArrowLeft, Send, BookOpen, FileText, BrainCircuit, GraduationCap, RotateCcw, CheckCircle2 } from 'lucide-react';

interface CourseViewProps {
  user: any;
  onLogout: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

// Mock course data with details
const coursesData: Record<string, any> = {
  '1': {
    name: 'Introduction to Computer Science',
    code: 'CS 101',
    modules: [
      { name: 'Week - 3 Overview', detail: 'Lecture 5-8, Textbook Ch. 9' },
    ],
    assignments: [
      { name: 'Reading 7', due: 'Oct 19' },
      { name: 'Lab 4', due: 'Oct 27' },
    ],
    recentQuestions: [
      'What are Alleles?',
      'Explain punnet squares',
      'Show example problems',
      'Am I cooked for this midterm?',
    ],
    flashcards: [
      { id: '1', question: 'What is an algorithm?', answer: 'A step-by-step procedure for solving a problem or accomplishing a task.' },
      { id: '2', question: 'Define variable', answer: 'A named storage location in memory that holds a value.' },
      { id: '3', question: 'What is a loop?', answer: 'A programming construct that repeats a block of code multiple times.' },
    ],
    quizzes: [
      { name: 'Variables & Data Types', questions: 10, score: null },
      { name: 'Control Flow', questions: 8, score: '75%' },
      { name: 'Functions Basics', questions: 12, score: null },
    ],
    syllabusSummary: 'This course introduces fundamental programming concepts including variables, control structures, functions, and basic data structures. Students will learn problem-solving techniques and computational thinking.',
    readings: [
      { title: 'Chapter 9: Advanced Loops', summary: 'Covers nested loops, loop optimization, and common loop patterns in programming.' },
      { title: 'Chapter 8: Functions', summary: 'Introduction to function definition, parameters, return values, and scope.' },
    ],
  },
  '2': {
    name: 'Data Structures and Algorithms',
    code: 'CS 201',
    modules: [
      { name: 'Week - 4 Overview', detail: 'Lecture 9-12, Binary Trees' },
    ],
    assignments: [
      { name: 'Assignment 3', due: 'Oct 22' },
      { name: 'Quiz 2', due: 'Oct 25' },
    ],
    recentQuestions: [
      'How do binary trees work?',
      'Explain Big O notation',
      'Tree traversal methods',
    ],
    flashcards: [
      { id: '1', question: 'What is Big O notation?', answer: 'A mathematical notation describing the limiting behavior of a function as the argument tends toward infinity.' },
      { id: '2', question: 'Define a binary tree', answer: 'A tree data structure where each node has at most two children.' },
      { id: '3', question: 'What is recursion?', answer: 'A method where a function calls itself to solve smaller instances of the same problem.' },
    ],
    quizzes: [
      { name: 'Binary Trees', questions: 15, score: null },
      { name: 'Sorting Algorithms', questions: 10, score: '88%' },
      { name: 'Graph Theory', questions: 12, score: null },
    ],
    syllabusSummary: 'Advanced study of data structures including trees, graphs, and hash tables. Analysis of algorithm efficiency and complexity theory.',
    readings: [
      { title: 'Binary Tree Traversal', summary: 'In-order, pre-order, and post-order traversal methods explained with examples.' },
      { title: 'Algorithm Complexity', summary: 'Understanding time and space complexity with Big O notation.' },
    ],
  },
  '3': {
    name: 'Web Development Fundamentals',
    code: 'CS 230',
    modules: [
      { name: 'Week - 5 Overview', detail: 'Lecture 13-16, React Basics' },
    ],
    assignments: [
      { name: 'Project 2', due: 'Oct 30' },
      { name: 'Reading 5', due: 'Oct 20' },
    ],
    recentQuestions: [
      'What is JSX?',
      'Explain React hooks',
      'Component lifecycle',
    ],
    flashcards: [
      { id: '1', question: 'What is JSX?', answer: 'JavaScript XML - a syntax extension for JavaScript used in React to describe UI structure.' },
      { id: '2', question: 'What is useState?', answer: 'A React Hook that lets you add state to functional components.' },
      { id: '3', question: 'What is a component?', answer: 'A reusable piece of UI in React that can accept props and manage its own state.' },
    ],
    quizzes: [
      { name: 'HTML & CSS Basics', questions: 20, score: '92%' },
      { name: 'JavaScript Fundamentals', questions: 15, score: '85%' },
      { name: 'React Components', questions: 12, score: null },
    ],
    syllabusSummary: 'Learn to build modern web applications using HTML, CSS, JavaScript, and React. Focus on responsive design and component-based architecture.',
    readings: [
      { title: 'React Fundamentals', summary: 'Introduction to React components, props, and state management.' },
      { title: 'Modern JavaScript', summary: 'ES6+ features including arrow functions, destructuring, and modules.' },
    ],
  },
  '4': {
    name: 'Calculus II',
    code: 'MATH 152',
    modules: [
      { name: 'Week - 6 Overview', detail: 'Lecture 17-20, Integration' },
    ],
    assignments: [
      { name: 'Homework 6', due: 'Oct 23' },
      { name: 'Quiz 3', due: 'Oct 26' },
    ],
    recentQuestions: [
      'Integration by parts',
      'Trig substitution',
      'Practice problems needed',
    ],
    flashcards: [
      { id: '1', question: 'Integration by parts formula?', answer: '∫u dv = uv - ∫v du' },
      { id: '2', question: 'What is a definite integral?', answer: 'An integral with upper and lower bounds that gives a numerical value.' },
      { id: '3', question: 'Fundamental Theorem of Calculus?', answer: 'Links differentiation and integration as inverse operations.' },
    ],
    quizzes: [
      { name: 'Integration Techniques', questions: 10, score: null },
      { name: 'Sequences & Series', questions: 8, score: '78%' },
      { name: 'Parametric Equations', questions: 12, score: null },
    ],
    syllabusSummary: 'Advanced integration techniques, sequences and series, parametric equations, and polar coordinates. Applications to physics and engineering.',
    readings: [
      { title: 'Integration Methods', summary: 'Substitution, integration by parts, partial fractions, and trigonometric substitution.' },
      { title: 'Infinite Series', summary: 'Convergence tests and Taylor series expansion.' },
    ],
  },
  '5': {
    name: 'Physics for Engineers',
    code: 'PHYS 201',
    modules: [
      { name: 'Week - 7 Overview', detail: 'Lecture 21-24, Electromagnetism' },
    ],
    assignments: [
      { name: 'Lab Report 3', due: 'Oct 28' },
      { name: 'Problem Set 5', due: 'Oct 21' },
    ],
    recentQuestions: [
      'Electric field calculations',
      'Magnetic force problems',
      'Right hand rule',
    ],
    flashcards: [
      { id: '1', question: 'What is electric field?', answer: 'A region around a charged particle where a force would be exerted on other charges.' },
      { id: '2', question: 'Coulomb\'s Law formula?', answer: 'F = k(q₁q₂)/r²' },
      { id: '3', question: 'Right-hand rule for magnetism?', answer: 'Points thumb in current direction, fingers curl in magnetic field direction.' },
    ],
    quizzes: [
      { name: 'Electric Fields', questions: 15, score: null },
      { name: 'Magnetism', questions: 12, score: '81%' },
      { name: 'Circuits', questions: 10, score: '90%' },
    ],
    syllabusSummary: 'Study of electricity, magnetism, circuits, and electromagnetic waves. Laboratory component includes hands-on experiments and data analysis.',
    readings: [
      { title: 'Electromagnetic Theory', summary: 'Maxwell\'s equations and electromagnetic wave propagation.' },
      { title: 'Circuit Analysis', summary: 'Kirchhoff\'s laws, RC circuits, and AC analysis.' },
    ],
  },
  '6': {
    name: 'Database Systems',
    code: 'CS 340',
    modules: [
      { name: 'Week - 8 Overview', detail: 'Lecture 25-28, SQL Queries' },
    ],
    assignments: [
      { name: 'Assignment 4', due: 'Oct 24' },
      { name: 'Project Milestone', due: 'Oct 29' },
    ],
    recentQuestions: [
      'JOIN operations',
      'Database normalization',
      'Index optimization',
    ],
    flashcards: [
      { id: '1', question: 'What is normalization?', answer: 'The process of organizing database tables to reduce redundancy and improve data integrity.' },
      { id: '2', question: 'Define PRIMARY KEY', answer: 'A unique identifier for each record in a database table.' },
      { id: '3', question: 'What is a JOIN?', answer: 'An SQL operation that combines rows from two or more tables based on a related column.' },
    ],
    quizzes: [
      { name: 'SQL Fundamentals', questions: 20, score: '95%' },
      { name: 'Normalization', questions: 10, score: null },
      { name: 'Indexing & Performance', questions: 15, score: null },
    ],
    syllabusSummary: 'Comprehensive study of database design, SQL, normalization, transactions, and performance optimization. Includes project work with real databases.',
    readings: [
      { title: 'Advanced SQL', summary: 'Subqueries, joins, views, and stored procedures.' },
      { title: 'Database Design', summary: 'ER diagrams, normalization forms, and best practices.' },
    ],
  },
};

export default function CourseView({ user, onLogout }: CourseViewProps) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'chat' | 'flashcards' | 'quiz' | 'syllabus' | 'readings'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const course = courseId ? coursesData[courseId] : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you're asking about "${inputMessage}". Let me help you with that based on your ${course?.name} course materials. This is a demo response - in the full version, I'll provide detailed explanations tailored to your coursework.`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFlipFlashcard = () => {
    setShowFlashcardAnswer(!showFlashcardAnswer);
  };

  const handleNextFlashcard = () => {
    if (course && currentFlashcardIndex < course.flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setShowFlashcardAnswer(false);
    }
  };

  const handlePrevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setShowFlashcardAnswer(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl text-gray-900 mb-2">Course Not Found</h2>
            <p className="text-gray-600 mb-4">
              The course you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const currentFlashcard = course.flashcards[currentFlashcardIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-gray-900">SnapSyllabus</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {course.code}
          </Badge>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gray-300 text-gray-700">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm text-gray-900 mb-4">SideBar</h2>

            {/* Course Info */}
            <div className="mb-6">
              <h3 className="text-sm text-gray-900 mb-3">
                {course.name}
              </h3>
              {course.modules.map((module: any, idx: number) => (
                <div key={idx} className="mb-2">
                  <p className="text-sm text-gray-700">{module.name}</p>
                  <p className="text-xs text-gray-500">{module.detail}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm text-gray-900 mb-3">
                Study Tools:
              </h3>
              <div className="space-y-2">
                <Button
                  variant={activeView === 'flashcards' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveView('flashcards')}
                >
                  <BrainCircuit className="h-4 w-4" />
                  Flashcards ({course.flashcards.length})
                </Button>
                <Button
                  variant={activeView === 'quiz' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveView('quiz')}
                >
                  <GraduationCap className="h-4 w-4" />
                  Practice Quizzes
                </Button>
                <Button
                  variant={activeView === 'syllabus' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveView('syllabus')}
                >
                  <FileText className="h-4 w-4" />
                  Syllabus Summary
                </Button>
                <Button
                  variant={activeView === 'readings' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveView('readings')}
                >
                  <BookOpen className="h-4 w-4" />
                  Reading Summaries
                </Button>
                <Button
                  variant={activeView === 'chat' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveView('chat')}
                >
                  <Send className="h-4 w-4" />
                  AI Chat
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Assignments */}
            <div className="mb-6">
              <h3 className="text-sm text-gray-900 mb-3">
                Assignments:
              </h3>
              {course.assignments.map((assignment: any, idx: number) => (
                <div key={idx} className="mb-2">
                  <p className="text-sm text-gray-700">{assignment.name}</p>
                  <p className="text-xs text-gray-500">Due {assignment.due}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Recent Questions */}
            <div>
              <h3 className="text-sm text-gray-900 mb-3">
                Recent Questions:
              </h3>
              <div className="space-y-2">
                {course.recentQuestions.map((question: string, idx: number) => (
                  <button
                    key={idx}
                    className="text-xs text-gray-600 hover:text-blue-600 text-left w-full transition-colors"
                    onClick={() => {
                      setActiveView('chat');
                      setInputMessage(question);
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col bg-white">
          {/* View Content */}
          {activeView === 'chat' && (
            <>
              {/* Course Title Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <Badge variant="outline" className="mb-2">
                  {course.code}
                </Badge>
                <h2 className="text-xl text-gray-600">
                  Welcome to {course.name}, how may I help you?
                </h2>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        Ask me anything about {course.name}
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.sender === 'ai' && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              AI
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 max-w-xl ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        {message.sender === 'user' && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-gray-300 text-gray-700">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.4s' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="px-6 py-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
                  <div className="flex gap-3">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Enter question here:"
                      className="flex-1 rounded-full border-gray-300"
                    />
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || isTyping}
                      className="rounded-full px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}

          {activeView === 'flashcards' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="max-w-2xl w-full">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl text-gray-900 mb-2">Flashcards</h2>
                  <p className="text-gray-600">
                    Card {currentFlashcardIndex + 1} of {course.flashcards.length}
                  </p>
                </div>

                <Card
                  className="min-h-[300px] flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={handleFlipFlashcard}
                >
                  <CardContent className="text-center p-8">
                    <p className="text-sm text-gray-500 mb-4">
                      {showFlashcardAnswer ? 'Answer' : 'Question'}
                    </p>
                    <p className="text-xl text-gray-900">
                      {showFlashcardAnswer ? currentFlashcard.answer : currentFlashcard.question}
                    </p>
                    <p className="text-sm text-gray-500 mt-8">
                      Click to flip
                    </p>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevFlashcard}
                    disabled={currentFlashcardIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleFlipFlashcard}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Flip Card
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextFlashcard}
                    disabled={currentFlashcardIndex === course.flashcards.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'quiz' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl text-gray-900 mb-2">Practice Quizzes</h2>
                <p className="text-gray-600 mb-8">
                  Test your knowledge with AI-generated quizzes
                </p>

                <div className="space-y-4">
                  {course.quizzes.map((quiz: any, idx: number) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{quiz.name}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              {quiz.questions} questions
                            </p>
                          </div>
                          {quiz.score && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {quiz.score}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant={quiz.score ? 'outline' : 'default'}
                          className="w-full"
                        >
                          {quiz.score ? 'Retake Quiz' : 'Start Quiz'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === 'syllabus' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl text-gray-900 mb-2">Syllabus Summary</h2>
                <p className="text-gray-600 mb-8">
                  AI-generated overview of your course
                </p>

                <Card>
                  <CardHeader>
                    <CardTitle>{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {course.syllabusSummary}
                    </p>
                    
                    <div className="mt-6">
                      <h3 className="text-sm text-gray-900 mb-3">Key Topics:</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Problem Solving</Badge>
                        <Badge variant="outline">Programming</Badge>
                        <Badge variant="outline">Data Structures</Badge>
                        <Badge variant="outline">Algorithms</Badge>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        View Full Syllabus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === 'readings' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl text-gray-900 mb-2">Reading Summaries</h2>
                <p className="text-gray-600 mb-8">
                  AI-generated summaries of your course readings
                </p>

                <div className="space-y-4">
                  {course.readings.map((reading: any, idx: number) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">{reading.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">
                          {reading.summary}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Read More
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            Ask AI about this
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
