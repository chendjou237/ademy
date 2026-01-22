import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is a trainer
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "trainer") {
      return NextResponse.json({ error: "Only trainers can upload videos" }, { status: 403 })
    }

    const { title } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Video title is required" }, { status: 400 })
    }

    // Create video in Bunny Stream
    const response = await fetch(`https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        AccessKey: process.env.BUNNY_API_KEY!,
      },
      body: JSON.stringify({
        title,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Bunny API error:", error)
      return NextResponse.json({ error: "Failed to create video in Bunny Stream" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      videoId: data.guid,
      libraryId: process.env.BUNNY_LIBRARY_ID,
    })
  } catch (error) {
    console.error("[v0] Error creating video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
