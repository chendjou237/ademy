"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { PaymentModal } from "./payment-modal"

interface EnrollButtonProps {
  courseId: string
  userId: string
  coursePrice: number
  trainerId: string
}

export function EnrollButton({ courseId, userId, coursePrice, trainerId }: EnrollButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState("")
  const [transactionId, setTransactionId] = useState("")

  const handleEnroll = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const supabase = createClient()

      // Check if course is free or paid
      if (coursePrice === 0) {
        // Free course - enroll directly
        const { error } = await supabase.from("enrollments").insert({
          learner_id: userId,
          course_id: courseId,
          payment_status: 'FREE',
        })

        if (error) throw error

        setSuccess("Successfully enrolled! Redirecting...")
        setTimeout(() => {
          router.push("/learner/dashboard")
          router.refresh()
        }, 1500)
      } else {
        // Paid course - initialize payment
        const response = await fetch('/api/payments/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: coursePrice,
            courseId,
            trainerId,
            returnUrl: `${window.location.origin}/courses/${courseId}`,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to initialize payment')
        }

        const result = await response.json()

        // Store payment details and show modal
        setTransactionId(result.data.transaction_id)
        setPaymentUrl(result.data.transaction_url)
        setShowPayment(true)
      }
    } catch (err: any) {
      console.error('Error enrolling:', err)
      setError(err.message || "Failed to enroll in course")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (transactionId: string) => {
    setShowPayment(false)
    setLoading(true)

    try {
      // Complete enrollment after successful payment
      const response = await fetch('/api/payments/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          courseId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete enrollment')
      }

      setSuccess("Payment successful! Enrollment confirmed. Redirecting...")
      setTimeout(() => {
        router.push("/learner/dashboard")
        router.refresh()
      }, 2000)
    } catch (err: any) {
      console.error('Error completing enrollment:', err)
      setError(err.message || "Payment successful but enrollment failed. Please contact support.")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    setError("Payment cancelled. You can try again when ready.")
  }

  const handlePaymentError = (errorMessage: string) => {
    setShowPayment(false)
    setError(errorMessage || "Payment failed. Please try again.")
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-500 bg-green-50 text-green-900">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Button className="w-full" onClick={handleEnroll} disabled={loading}>
        {loading ? "Processing..." : coursePrice === 0 ? "Enroll Now" : `Enroll for ${coursePrice.toLocaleString()} XAF`}
      </Button>

      {/* Payment Modal */}
      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        paymentUrl={paymentUrl}
        transactionId={transactionId}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        onError={handlePaymentError}
      />
    </div>
  )
}
