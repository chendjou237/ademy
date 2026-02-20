"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface QuizQuestion {
  id: string
  type: "single" | "multiple" | "true_false"
  prompt: string
  options?: string[]
  points: number
}

interface QuizTakerProps {
  quizId: string
  title: string
  instructions?: string | null
  passPercent: number
  timeLimitMinutes?: number | null
  questions: QuizQuestion[]
  latestAttempt?: {
    score: number
    total_points: number
    passed: boolean
    submitted_at: string
  } | null
  attempts?: {
    score: number
    total_points: number
    passed: boolean
    submitted_at: string
  }[]
}

export function QuizTaker({
  quizId,
  title,
  instructions,
  passPercent,
  timeLimitMinutes,
  questions,
  latestAttempt,
  attempts = [],
}: QuizTakerProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(latestAttempt || null)
  const [error, setError] = useState("")
  const [hasStarted, setHasStarted] = useState(!latestAttempt)
  const [timeLeft, setTimeLeft] = useState(
    timeLimitMinutes ? Math.max(1, Math.round(timeLimitMinutes * 60)) : null
  )
  const autoSubmittedRef = useRef(false)

  useEffect(() => {
    if (!timeLimitMinutes || result) return
    setTimeLeft(Math.max(1, Math.round(timeLimitMinutes * 60)))
    autoSubmittedRef.current = false
  }, [timeLimitMinutes, result])

  useEffect(() => {
    if (!timeLimitMinutes || timeLeft === null || result) return

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [timeLimitMinutes, timeLeft, result])

  useEffect(() => {
    if (!timeLimitMinutes || timeLeft === null || !hasStarted) return
    if (timeLeft === 0 && !autoSubmittedRef.current && !submitting && !result) {
      autoSubmittedRef.current = true
      handleSubmit()
    }
  }, [timeLeft, timeLimitMinutes, submitting, result, hasStarted])

  const handleSubmit = async () => {
    if (result) return
    setSubmitting(true)
    setError("")

    const payload = {
      quizId,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
    }

    try {
      const response = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || "Failed to submit quiz")
      }

      setResult(result.data)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStart = () => {
    setHasStarted(true)
    setResult(null)
    setAnswers({})
    setError("")
    if (timeLimitMinutes) {
      setTimeLeft(Math.max(1, Math.round(timeLimitMinutes * 60)))
    }
  }

  const handleRetake = () => {
    setHasStarted(true)
    setResult(null)
    setAnswers({})
    setError("")
    if (timeLimitMinutes) {
      setTimeLeft(Math.max(1, Math.round(timeLimitMinutes * 60)))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {instructions ? <CardDescription>{instructions}</CardDescription> : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Pass {passPercent}%</Badge>
            {timeLimitMinutes ? (
              <Badge variant="secondary">
                {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}` : `${timeLimitMinutes} min`}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasStarted ? (
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Ready to take this quiz?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleStart}>Start Quiz</Button>
              <Button variant="outline" onClick={() => setHasStarted(false)}>
                Not now
              </Button>
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Last attempt</p>
            <p className="text-lg font-semibold text-foreground">
              Score {result.score}/{result.total_points}
            </p>
            <p className={result.passed ? "text-sm text-secondary" : "text-sm text-destructive"}>
              {result.passed ? "Passed" : "Not passed"}
            </p>
            <div className="mt-3">
              <Button variant="outline" onClick={handleRetake}>
                Retake Quiz
              </Button>
            </div>
          </div>
        ) : null}

        {attempts.length > 0 ? (
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Attempt history</p>
            <div className="space-y-2 text-sm">
              {attempts.map((attempt) => (
                <div key={attempt.submitted_at} className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {new Date(attempt.submitted_at).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-foreground">
                    {attempt.score}/{attempt.total_points}
                  </span>
                  <span className={attempt.passed ? "text-secondary" : "text-destructive"}>
                    {attempt.passed ? "Passed" : "Not passed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {hasStarted && !result ? questions.map((question) => (
          <div key={question.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{question.type}</Badge>
              <span className="text-xs text-muted-foreground">{question.points} pts</span>
            </div>
            <p className="font-medium text-foreground">{question.prompt}</p>

            {question.type === "single" ? (
              <RadioGroup
                value={answers[question.id] ?? ""}
                onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
              >
                {(question.options || []).map((option) => (
                  <div key={option} className="flex items-center gap-2">
                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                    <label htmlFor={`${question.id}-${option}`} className="text-sm">
                      {option}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            ) : null}

            {question.type === "multiple" ? (
              <div className="space-y-2">
                {(question.options || []).map((option) => {
                  const values = Array.isArray(answers[question.id]) ? answers[question.id] : []
                  const checked = values.includes(option)
                  return (
                    <div key={option} className="flex items-center gap-2">
                      <Checkbox
                        id={`${question.id}-${option}`}
                        checked={checked}
                        onCheckedChange={(value) => {
                          const next = value
                            ? [...values, option]
                            : values.filter((item: string) => item !== option)
                          setAnswers({ ...answers, [question.id]: next })
                        }}
                      />
                      <label htmlFor={`${question.id}-${option}`} className="text-sm">
                        {option}
                      </label>
                    </div>
                  )
                })}
              </div>
            ) : null}

            {question.type === "true_false" ? (
              <RadioGroup
                value={typeof answers[question.id] === "boolean" ? String(answers[question.id]) : ""}
                onValueChange={(value) => setAnswers({ ...answers, [question.id]: value === "true" })}
              >
                {["true", "false"].map((option) => (
                  <div key={option} className="flex items-center gap-2">
                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                    <label htmlFor={`${question.id}-${option}`} className="text-sm">
                      {option === "true" ? "True" : "False"}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            ) : null}
          </div>
        )) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button onClick={handleSubmit} disabled={submitting || timeLeft === 0 || !hasStarted || !!result}>
          {submitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </CardContent>
    </Card>
  )
}
