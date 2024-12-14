// pages/index.tsx
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  BookOpen, 
  Calculator, 
  Pencil, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Info 
} from 'lucide-react'

// Learning Disability Data
const LEARNING_DISABILITIES = [
  {
    name: "Dyslexia",
    difficultyAreas: [
      "Reading fluency",
      "Decoding words",
      "Spelling",
      "Reading comprehension"
    ],
    solutions: [
      "Structured Literacy Programs",
      "Assistive Technology",
      "Text-to-speech software",
      "Audiobooks"
    ]
  },
  {
    name: "Dyscalculia",
    difficultyAreas: [
      "Math skills",
      "Understanding numbers",
      "Applying math concepts"
    ],
    solutions: [
      "Manipulatives",
      "Visual Aids",
      "Math Software",
      "Practice with physical objects"
    ]
  },
  {
    name: "Dysgraphia",
    difficultyAreas: [
      "Handwriting",
      "Fine motor skills",
      "Written expression"
    ],
    solutions: [
      "Occupational Therapy",
      "Speech-to-text software",
      "Adapted writing tools"
    ]
  }
]

interface Message {
  text: string
  sender: 'bot' | 'user'
  type?: 'welcome' | 'normal' | 'positive' | 'mild' | 'moderate' | 'severe' | 'info'
}

export default function LearningDisabilityScreening() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Welcome to LD Assist! This is an initial screening tool for learning disabilities. Please remember that it's not a diagnostic tool and should be followed up with professional consultation for comprehensive assessment and guidance.",
      sender: 'bot',
      type: 'welcome'
    }
  ])
  const [currentStage, setCurrentStage] = useState<string>('welcome')
  const [symptomScore, setSymptomScore] = useState<number>(0)
  const [detectedDisabilities, setDetectedDisabilities] = useState<string[]>([])
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null)

  const stages = {
    welcome: {
      questions: ["Are you ready to start our learning disability screening?"],
      nextStage: 'readingComprehension'
    },
    readingComprehension: {
      title: "Reading Skills",
      questions: [
        "Do you struggle with reading fluently?",
        "Do you find it hard to decode or understand words?",
        "Do you have persistent spelling difficulties?"
      ],
      nextStage: 'mathematicalReasoning',
      associatedDisability: 'Dyslexia'
    },
    mathematicalReasoning: {
      title: "Mathematical Skills",
      questions: [
        "Do you find math concepts challenging to understand?",
        "Do numbers and mathematical operations feel confusing?",
        "Do you struggle with applying mathematical principles?"
      ],
      nextStage: 'writingSkills',
      associatedDisability: 'Dyscalculia'
    },
    writingSkills: {
      title: "Writing and Motor Skills",
      questions: [
        "Do you find handwriting particularly difficult?",
        "Do you struggle with written expression?",
        "Do fine motor skills seem challenging?"
      ],
      nextStage: 'result',
      associatedDisability: 'Dysgraphia'
    }
  }

  const addMessage = (message: Partial<Message>) => {
    setMessages(prev => [...prev, message as Message])
  }

  const handleUserResponse = (response: 'yes' | 'no') => {
    const currentStageData = stages[currentStage as keyof typeof stages]

    // Add user's response message
    addMessage({ 
      text: response === 'yes' ? 'Yes' : 'No', 
      sender: 'user' 
    })

    // Track symptom score and potential disabilities
    if (response === 'yes') {
      setSymptomScore(prev => prev + 1)
      if (currentStageData.associatedDisability) {
        setDetectedDisabilities(prev => 
          prev.includes(currentStageData.associatedDisability) 
            ? prev 
            : [...prev, currentStageData.associatedDisability]
        )
      }
    }

    // Progress through stages
    if (currentStage === 'welcome') {
      setCurrentStage('readingComprehension')
      addMessage({
        text: `Let's explore ${stages.readingComprehension.title}.`,
        sender: 'bot'
      })
      addMessage({
        text: stages.readingComprehension.questions[0],
        sender: 'bot'
      })
      return
    }

    // Handle question progression
    const currentQuestions = currentStageData.questions
    const currentQuestionIndex = messages.filter(m => m.sender === 'bot' && m.type === undefined).length - 1

    if (currentQuestionIndex < currentQuestions.length - 1) {
      addMessage({
        text: currentQuestions[currentQuestionIndex + 1],
        sender: 'bot'
      })
    } else if (currentStage === 'writingSkills') {
      // Move to result stage
      setTimeout(() => {
        setCurrentStage('result')
        analyzeResults()
      }, 1000)
    }
  }

  const analyzeResults = () => {
    let resultMessage = ""
    let resultType: Message['type'] = 'normal'

    if (symptomScore === 0) {
      resultMessage = "No significant learning disability indicators detected. Keep up the great work!"
      resultType = 'positive'
    } else if (symptomScore <= 2) {
      resultMessage = "Mild potential indicators detected. Consider professional consultation."
      resultType = 'mild'
    } else {
      resultMessage = `Potential learning challenges identified in: ${detectedDisabilities.join(', ')}.  Please remember that this is an initial screening. Consult a qualified professional for diagnosis and personalized guidance.`
      resultType = 'moderate'
    }

    addMessage({ 
      text: resultMessage, 
      sender: 'bot', 
      type: resultType 
    })

    // Add informational message about detected disabilities
    if (detectedDisabilities.length > 0) {
      addMessage({
        text: "Would you like to learn more about the potential learning disabilities detected?",
        sender: 'bot',
        type: 'info'
      })
    }
  }

  const renderDisabilityDetails = (disability: string) => {
    const disabilityInfo = LEARNING_DISABILITIES.find(d => d.name === disability)
    
    if (!disabilityInfo) return null

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">{disabilityInfo.name}</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">Difficulty Areas:</h3>
            <ul className="list-disc list-inside text-gray-600">
              {disabilityInfo.difficultyAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700">Possible Solutions:</h3>
            <ul className="list-disc list-inside text-gray-600">
              {disabilityInfo.solutions.map((solution, index) => (
                <li key={index}>{solution}</li>
              ))}
            </ul>
          </div>

          <button 
            onClick={() => setShowDetailModal(null)}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200">
      <Head>
        <title>LD Assist - Learning Disability Screening</title>
        <meta name="description" content="Supportive learning disability screening platform" />
      </Head>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center">
          <Brain className="mr-3" />
          <div>
            <h1 className="text-xl font-bold">LD Assist</h1>
            <p className="text-sm">Learning Disability Screening</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-[500px] overflow-y-auto p-4 flex flex-col space-y-3">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`
                  max-w-[80%] px-4 py-3 rounded-2xl mb-2
                  ${msg.sender === 'bot' ? 'self-start bg-blue-50 text-gray-800' : 'self-end bg-blue-500 text-white'}
                  ${msg.type === 'welcome' && 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'}
                  ${msg.type === 'positive' && 'bg-green-100 text-green-800'}
                  ${msg.type === 'mild' && 'bg-yellow-100 text-yellow-800'}
                  ${msg.type === 'moderate' && 'bg-orange-100 text-orange-800'}
                  ${msg.type === 'info' && 'bg-blue-100 text-blue-800'}
                `}
              >
                {msg.text}
                {msg.type === 'info' && (
                  <div className="flex space-x-2 mt-2">
                    {detectedDisabilities.map((disability) => (
                      <button
                        key={disability}
                        onClick={() => setShowDetailModal(disability)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        <Info className="mr-1 w-4 h-4" /> {disability}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Response Area */}
        {currentStage !== 'result' && (
          <div className="p-4 bg-gray-100 flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUserResponse('yes')}
              className="flex-1 bg-green-500 text-white py-3 rounded-full hover:bg-green-600 transition-colors"
            >
              Yes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUserResponse('no')}
              className="flex-1 bg-red-500 text-white py-3 rounded-full hover:bg-red-600 transition-colors"
            >
              No
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Disability Details Modal */}
      {showDetailModal && renderDisabilityDetails(showDetailModal)}
    </div>
  )
}