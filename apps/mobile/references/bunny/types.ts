export function getBunnyPlaybackUrl(libraryId: string, videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`
}

export function getBunnyHlsUrl(libraryId: string, videoId: string): string {
  return `https://video.bunnycdn.com/play/${libraryId}/${videoId}/playlist.m3u8`
}

export function getBunnyThumbnailUrl(libraryId: string, videoId: string): string {
  return `https://vz-${libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`
}

export async function checkVideoStatus(libraryId: string, videoId: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
      headers: {
        Accept: "application/json",
        AccessKey: apiKey,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to check video status")
    }

    const data = await response.json()
    return data.status || "unknown"
  } catch (error) {
    console.error("[v0] Error checking video status:", error)
    return "unknown"
  }
}
