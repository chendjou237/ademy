"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface CertificateActionsProps {
  courseId: string
  targetId?: string
}

export function CertificateActions({ courseId, targetId = "certificate-preview" }: CertificateActionsProps) {
  const handleDownload = async () => {
    const target = document.getElementById(targetId)
    if (!target) return

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [canvas.width, canvas.height],
    })

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
    pdf.save("certificate.pdf")
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href={`/learner/courses/${courseId}`}>Back to course</Link>
      </Button>
      <Button onClick={handleDownload}>Download PDF</Button>
    </div>
  )
}
