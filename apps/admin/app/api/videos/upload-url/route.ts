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

    // Generate TUS upload URL - Bunny Stream uses a specific TUS endpoint
    const uploadUrl = `https://video.bunnycdn.com/tusupload`

    return NextResponse.json({
      uploadUrl,
      libraryId: process.env.BUNNY_LIBRARY_ID,
      apiKey: process.env.BUNNY_API_KEY,
    })
  } catch (error) {
    console.error("[v0] Error generating upload URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
