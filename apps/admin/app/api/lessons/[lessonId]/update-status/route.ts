import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { lessonId } = await params
    const { status } = await request.json()

    // Update lesson video status
    const { error } = await supabase
      .from("lessons")
      .update({ video_status: status })
      .eq("id", lessonId)

    if (error) {
      console.error("[v0] Error updating lesson status:", error)
      return NextResponse.json({ error: "Failed to update lesson status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating lesson status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
