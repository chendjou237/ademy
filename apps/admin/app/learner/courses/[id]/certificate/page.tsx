import { CertificateActions } from "@/components/learner/certificate-actions"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"

export default async function CourseCertificatePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, progress, course_id")
    .eq("learner_id", user.id)
    .eq("course_id", id)
    .single()

  if (!enrollment) {
    redirect(`/courses/${id}`)
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, trainer_id, certificate_enabled, certificate_signature_name, certificate_signature_title, profiles!courses_trainer_id_fkey(full_name)")
    .eq("id", id)
    .single()

  if (!course) {
    notFound()
  }

  if (!course.certificate_enabled) {
    redirect(`/learner/courses/${id}`)
  }

  const { data: lessons } = await supabase.from("lessons").select("id").eq("course_id", id)
  const { data: lessonProgress } = await supabase
    .from("lesson_progress")
    .select("id, completed")
    .eq("enrollment_id", enrollment.id)

  const lessonCount = lessons?.length || 0
  const completedLessons = (lessonProgress || []).filter((row) => row.completed).length
  const computedProgress = lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0
  const storedProgress = typeof enrollment.progress === "number" ? enrollment.progress : 0
  const progressPercentage = storedProgress > 0 ? storedProgress : computedProgress

  if (progressPercentage < 100) {
    redirect(`/learner/courses/${id}`)
  }

  const { data: learnerProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

  let { data: certificate } = await supabase
    .from("certificates")
    .select("id, issued_at")
    .eq("enrollment_id", enrollment.id)
    .maybeSingle()

  if (!certificate) {
    const { data: created } = await supabase
      .from("certificates")
      .insert({
        enrollment_id: enrollment.id,
        course_id: course.id,
        learner_id: user.id,
        trainer_id: course.trainer_id,
      })
      .select("id, issued_at")
      .single()

    certificate = created || null
  }

  const learnerName = learnerProfile?.full_name || learnerProfile?.email || "Learner"
  const trainerName = course.certificate_signature_name || course.profiles?.full_name || "Trainer"
  const trainerTitle = course.certificate_signature_title || "Trainer"
  const issuedAt = certificate?.issued_at ? new Date(certificate.issued_at) : new Date()
  const issuedDate = issuedAt.toLocaleDateString()

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Certificate of Completion</h1>
            <p className="text-sm text-muted-foreground">Download or print your certificate.</p>
          </div>
          <CertificateActions courseId={id} />
        </div>

        <div className="w-full overflow-hidden">
          <div
            id="certificate-preview"
            className="relative mx-auto w-full max-w-[720px] aspect-[9/16] bg-white shadow-xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/certificates/ademy-certificate.png')" }}
            />

            <div className="absolute left-1/2 top-[46%] w-[80%] -translate-x-1/2 text-center">
              <p className="text-lg font-semibold text-foreground">{learnerName}</p>
            </div>

            <div className="absolute left-1/2 top-[54%] w-[80%] -translate-x-1/2 text-center">
              <p className="text-sm text-foreground">for successfully completing</p>
              <p className="text-base font-semibold text-foreground">{course.title}</p>
            </div>

            <div className="absolute left-[16%] bottom-[12%] text-xs text-foreground">
              Date: {issuedDate}
            </div>

            <div className="absolute right-[16%] bottom-[12%] text-xs text-foreground text-right">
              <div>Signature: {trainerName}</div>
              <div className="text-[10px] text-muted-foreground">{trainerTitle}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
