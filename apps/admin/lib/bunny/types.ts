export interface BunnyVideo {
  videoId: string
  libraryId: string
  title: string
  status: "queued" | "processing" | "encoding" | "finished" | "failed"
  playbackUrl?: string
}

export interface BunnyUploadResponse {
  videoId: string
  libraryId: string
}

export interface BunnyUploadUrlResponse {
  uploadUrl: string
  videoId: string
  libraryId: string
  apiKey: string
}

export interface VideoUploadProgress {
  loaded: number
  total: number
  percentage: number
}
