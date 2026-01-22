import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ videoId: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { videoId } = await params

    // Get video status from Bunny
    const response = await fetch(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          Accept: "application/json",
          AccessKey: process.env.BUNNY_API_KEY!,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Bunny API error for video ${videoId}:`, errorText)

      if (response.status === 404) {
        return NextResponse.json({
          error: "Video not found in Bunny library",
          videoId,
          hint: "This video may have been deleted or the ID is incorrect"
        }, { status: 404 })
      }

      return NextResponse.json({ error: "Failed to get video status" }, { status: response.status })
    }

    const data = await response.json()

    // Map Bunny status codes to our status
    // 0 = Created, 1 = Uploaded, 2 = Processing, 3 = Encoding, 4 = Finished, 5 = Failed
    const statusMap: { [key: number]: string } = {
      0: "created",
      1: "uploaded",
      2: "processing",
      3: "encoding",
      4: "finished",
      5: "failed",
    }

    return NextResponse.json({
      videoId: data.guid,
      status: statusMap[data.status] || "unknown",
      title: data.title,
      length: data.length,
      thumbnailUrl: data.thumbnailFileName
        ? `https://vz-${process.env.BUNNY_LIBRARY_ID}.b-cdn.net/${data.guid}/${data.thumbnailFileName}`
        : null,
    })
  } catch (error) {
    console.error("[v0] Error checking video status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
