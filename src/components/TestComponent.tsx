import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface Question {
  text: string
  options: string[]
  correctAnswer: number
}

const questions: Question[] = [
  {
    text: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid", "Rome"],
    correctAnswer: 2,
  },
  {
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn", "Mercury"],
    correctAnswer: 1,
  },
  {
    text: "What is the largest mammal?",
    options: ["Elephant", "Giraffe", "Blue Whale", "Hippopotamus", "Rhinoceros"],
    correctAnswer: 2,
  },
  {
    text: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo", "Rembrandt"],
    correctAnswer: 2,
  },
  {
    text: "What is the chemical symbol for gold?",
    options: ["Ag", "Au", "Fe", "Cu", "Hg"],
    correctAnswer: 1,
  },
  {
    text: "Which country is home to the kangaroo?",
    options: ["New Zealand", "South Africa", "Australia", "Brazil", "India"],
    correctAnswer: 2,
  },
]

interface TestComponentProps {
  testId: number
  onComplete: (testId: number, score: number) => void
}

const TestComponent: React.FC<TestComponentProps> = ({ testId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [testCompleted, setTestCompleted] = useState(false)
  const [timerActive, setTimerActive] = useState(true)

  useEffect(() => {
    if (currentQuestion < questions.length && !testCompleted && timerActive) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            handleNextQuestion()
            return 10
          }
          return prevTime - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [currentQuestion, testCompleted, timerActive])

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setTimerActive(false)
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    setSelectedAnswer(null)
    setTimerActive(true)
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTimeLeft(10)
    } else {
      setTestCompleted(true)
    }
  }

  if (testCompleted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Test Completed</h1>
        <p className="text-xl mb-4">
          You got {score} out of {questions.length} questions correct.
        </p>
        <p className="text-xl mb-8">Your score: {Math.round((score / questions.length) * 100)}%</p>
        <Button onClick={() => onComplete(testId, score)}>Close</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Question {currentQuestion + 1}/{questions.length}
          </h1>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="#4B5563" strokeWidth="4" />
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="#10B981"
                strokeWidth="4"
                strokeDasharray="88"
                strokeDashoffset={88 * (1 - timeLeft / 10)}
                transform="rotate(-90 16 16)"
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
              {timeLeft}
            </span>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <p className="text-xl mb-6">{questions[currentQuestion].text}</p>
          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full justify-start text-left ${selectedAnswer === index ? "bg-blue-600" : "bg-gray-700"}`}
                disabled={selectedAnswer !== null}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="w-full">
          {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Test"}
        </Button>
      </div>
    </div>
  )
}

export default TestComponent

