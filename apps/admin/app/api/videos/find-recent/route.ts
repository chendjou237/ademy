import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title } = await request.json()

    // Get list of videos from Bunny, sorted by date
    const response = await fetch(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos?page=1&itemsPerPage=10&orderBy=date`,
      {
        headers: {
          Accept: "application/json",
          AccessKey: process.env.BUNNY_API_KEY!,
        },
      }
    )

    if (!response.ok) {
      console.error("[v0] Bunny API error:", await response.text())
      return NextResponse.json({ error: "Failed to get videos from Bunny" }, { status: response.status })
    }

    const data = await response.json()

    // Find the most recent video that matches the title
    const matchingVideo = data.items?.find((video: any) =>
      video.title === title && video.dateUploaded
    )

    if (matchingVideo) {
      return NextResponse.json({
        videoId: matchingVideo.guid,
        libraryId: process.env.BUNNY_LIBRARY_ID,
        title: matchingVideo.title,
        status: matchingVideo.status,
      })
    }

    // If no exact match, return the most recent video
    const mostRecent = data.items?.[0]
    if (mostRecent) {
      return NextResponse.json({
        videoId: mostRecent.guid,
        libraryId: process.env.BUNNY_LIBRARY_ID,
        title: mostRecent.title,
        status: mostRecent.status,
      })
    }

    return NextResponse.json({ error: "No videos found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Error finding recent video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
