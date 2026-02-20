"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface AddQuizQuestionDialogProps {
  quizId: string
  nextOrderIndex: number
  onCreated: (question: {
    id: string
    type: "single" | "multiple" | "true_false"
    prompt: string
    points: number
    order_index: number
  }) => void
}

export function AddQuizQuestionDialog({ quizId, nextOrderIndex, onCreated }: AddQuizQuestionDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"single" | "multiple" | "true_false">("single")
  const [prompt, setPrompt] = useState("")
  const [optionsRaw, setOptionsRaw] = useState("")
  const [correctRaw, setCorrectRaw] = useState("")
  const [points, setPoints] = useState("1")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const resetForm = () => {
    setType("single")
    setPrompt("")
    setOptionsRaw("")
    setCorrectRaw("")
    setPoints("1")
    setError("")
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError("Question prompt is required")
      return
    }

    const pointsValue = Number(points)
    if (!Number.isFinite(pointsValue) || pointsValue <= 0) {
      setError("Points must be a positive number")
      return
    }

    let options: string[] | null = null
    let correctAnswer: any = null

    if (type === "true_false") {
      const correctValue = correctRaw.trim().toLowerCase()
      if (correctValue !== "true" && correctValue !== "false") {
        setError("Select True or False as the correct answer")
        return
      }
      options = ["True", "False"]
      correctAnswer = { value: correctValue === "true" }
    } else {
      options = optionsRaw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
      if (!options.length) {
        setError("Provide at least one option")
        return
      }

      const correctValues = correctRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)

      if (!correctValues.length) {
        setError("Provide at least one correct answer (comma-separated)")
        return
      }

      correctAnswer = type === "single" ? { value: correctValues[0] } : { values: correctValues }
    }

    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("quiz_questions")
        .insert({
          quiz_id: quizId,
          type,
          prompt: prompt.trim(),
          options,
          correct_answer: correctAnswer,
          points: pointsValue,
          order_index: nextOrderIndex,
        })
        .select("id, type, prompt, points, order_index")
        .single()

      if (error) throw error

      setOpen(false)
      resetForm()
      if (data) onCreated(data)
    } catch (err: any) {
      setError(err.message || "Failed to add question")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (!next) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button>Add Question</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                const nextType = value as "single" | "multiple" | "true_false"
                setType(nextType)
                if (nextType === "true_false") {
                  setCorrectRaw((prev) => (prev === "true" || prev === "false" ? prev : "true"))
                }
              }}
            > 
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single choice</SelectItem>
                <SelectItem value="multiple">Multiple choice</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>

          {type !== "true_false" ? (
            <div className="space-y-2">
              <Label>Options (one per line)</Label>
              <Textarea value={optionsRaw} onChange={(e) => setOptionsRaw(e.target.value)} />
            </div>
          ) : null}

          {type === "true_false" ? (
            <div className="space-y-2">
              <Label>Correct answer</Label>
              <RadioGroup value={correctRaw || "true"} onValueChange={setCorrectRaw}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="true" id="correct-true" />
                  <label htmlFor="correct-true" className="text-sm">True</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="false" id="correct-false" />
                  <label htmlFor="correct-false" className="text-sm">False</label>
                </div>
              </RadioGroup>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Correct answer(s)</Label>
              <Input
                value={correctRaw}
                onChange={(e) => setCorrectRaw(e.target.value)}
                placeholder="Comma-separated values"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Points</Label>
            <Input type="number" value={points} min={1} onChange={(e) => setPoints(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Question"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
