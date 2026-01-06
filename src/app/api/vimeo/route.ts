import { NextResponse } from 'next/server'
import getVideoId from '@/sanity/utils/get-video-id'

interface VideoInput {
  _key: string
  url: string
  aspectRatio?: number
}

interface VideoOutput {
  _key: string
  url: string
  aspectRatio?: number
  status?: string
}

async function getVimeoDataById(item: VideoInput): Promise<VideoOutput> {
  const { url, _key, aspectRatio } = item

  // Skip videos that already have aspect ratio
  if (aspectRatio) {
    return {
      ...item,
    }
  }

  // Extract Vimeo ID from URL
  const videoData = getVideoId(url)
  
  if (!videoData || videoData.service !== 'vimeo' || !videoData.id) {
    return {
      ...item,
      status: `Not a valid Vimeo URL or unable to extract video ID`,
    }
  }

  const vimeoId = videoData.id
  const apiUrl = `https://api.vimeo.com/videos/${vimeoId}?fields=width,height`

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const { width, height } = data
      const calculatedAspectRatio = width / height

      return {
        _key,
        url,
        aspectRatio: calculatedAspectRatio,
        status: `Data synced for Vimeo ID: ${vimeoId} on ${new Date().toISOString()}`,
      }
    } else {
      console.error('Failed to fetch data for _key: ', _key)
      return {
        ...item,
        status: `Request to Vimeo API failed for Vimeo ID: ${vimeoId} [${response.status} - _key: ${_key}]. Check the Vimeo ID.`,
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      ...item,
      status: `Request to Vimeo API failed for ${_key} ${vimeoId} [${error.message}]`,
    }
  }
}

export async function POST(request: Request) {
  const isValid = true // TODO: Add secret key validation if needed
  if (!isValid) {
    return new Response('Invalid secret', { status: 401 })
  }

  const body = await request.json()
  const results: Array<VideoOutput> = []

  // Use async/await with Promise.all to fetch data for each item in parallel
  try {
    const videos = await Promise.all(
      body.data.map((item: VideoInput) => getVimeoDataById(item)),
    )

    // Process the data received for each item
    videos.forEach((data) => {
      results.push({
        _key: data._key,
        url: data.url,
        aspectRatio: data.aspectRatio,
        status: data.status,
      })
    })
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  return NextResponse.json({ results }, { status: 200 })
}
