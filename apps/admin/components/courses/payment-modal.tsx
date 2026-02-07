"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentUrl: string
  transactionId: string
  onSuccess: (transactionId: string) => void
  onCancel: () => void
  onError: (error: string) => void
}

export function PaymentModal({
  open,
  onOpenChange,
  paymentUrl,
  transactionId,
  onSuccess,
  onCancel,
  onError,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Poll payment status every 3 seconds
  useEffect(() => {
    if (!open || !transactionId) {
      // Clear polling when modal is closed
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    console.log('🔄 Starting payment status polling for transaction:', transactionId)

    const checkStatus = async () => {
      if (checkingStatus) return // Prevent concurrent checks

      try {
        setCheckingStatus(true)
        setStatusMessage("Checking payment status...")
        console.log('📡 Checking payment status...')

        const response = await fetch(`/api/payments/status/${transactionId}`)

        if (!response.ok) {
          throw new Error('Failed to check payment status')
        }

        const result = await response.json()
        const status = result.data.transaction_status

        console.log('📊 Payment status:', status)

        if (status === 'SUCCESS') {
          console.log('✅ Payment successful!')
          setStatusMessage("Payment successful!")

          // Clear polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }

          // Trigger success callback
          setTimeout(() => {
            onSuccess(transactionId)
          }, 1000)
        } else if (status === 'FAILED') {
          console.log('❌ Payment failed')
          setStatusMessage("Payment failed")

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }

          setTimeout(() => {
            onError('Payment failed. Please try again.')
          }, 1000)
        } else if (status === 'CANCELLED') {
          console.log('🚫 Payment cancelled')
          setStatusMessage("Payment cancelled")

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }

          setTimeout(() => {
            onCancel()
          }, 1000)
        } else {
          setStatusMessage("Waiting for payment...")
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        setStatusMessage("Checking payment...")
        // Don't stop polling on error, just log it
      } finally {
        setCheckingStatus(false)
      }
    }

    // Check immediately
    checkStatus()

    // Then poll every 3 seconds
    pollingIntervalRef.current = setInterval(checkStatus, 3000)

    // Cleanup on unmount or when modal closes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [open, transactionId, onSuccess, onError, onCancel, checkingStatus])

  const handleClose = () => {
    // Clear polling when user manually closes
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            You will be redirected to PayUnit to complete your payment securely.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 relative px-6 pb-6">
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Loading payment page...</p>
              </div>
            </div>
          )}

          {/* Payment iframe */}
          <iframe
            ref={iframeRef}
            src={paymentUrl}
            className="w-full h-full border border-border rounded-lg"
            onLoad={() => setLoading(false)}
            title="Payment Gateway"
          />

          {/* Status indicator */}
          {checkingStatus && (
            <div className="absolute bottom-8 right-8 bg-background border border-border rounded-lg shadow-lg p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{statusMessage}</span>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-between items-center border-t">
          <p className="text-sm text-muted-foreground">
            Secure payment powered by PayUnit
          </p>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
