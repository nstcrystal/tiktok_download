import express from 'express'
import cors from 'cors'
import { spawn } from 'node:child_process'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001

app.use(cors({ origin: true }))
app.use(express.json())

function runYtDlp(args, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const proc = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    let timeout = setTimeout(() => {
      proc.kill('SIGKILL')
      reject(new Error('yt-dlp timeout'))
    }, timeoutMs)

    proc.stdout.on('data', (d) => (stdout += d.toString()))
    proc.stderr.on('data', (d) => (stderr += d.toString()))

    proc.on('close', (code) => {
      clearTimeout(timeout)
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(stderr || `yt-dlp exited with ${code}`))
    })
    proc.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ytDlp: true })
})

// Meta via yt-dlp --dump-json (more reliable than oembed for title/thumbnail)
app.get('/api/youtube/meta', async (req, res) => {
  const url = req.query.url
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing url' })
  try {
    const { stdout } = await runYtDlp(['--dump-json', '--no-playlist', '--no-warnings', url], 20000)
    const data = JSON.parse(stdout)
    res.json({
      id: data.id,
      url: `https://www.youtube.com/watch?v=${data.id}`,
      title: data.title,
      thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.id}/hqdefault.jpg`,
      channel: data.uploader || data.channel || 'YouTube',
      channelUrl: data.uploader_url || data.channel_url || '',
      duration: data.duration,
      viewCount: data.view_count,
    })
  } catch (e) {
    // fallback to oembed
    try {
      const idMatch = url.match(/(?:v=|youtu\.be\/|shorts\/)([^&\s?]+)/)
      const id = idMatch?.[1] || ''
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`
      const r = await fetch(oembedUrl)
      if (r.ok) {
        const j = await r.json()
        return res.json({
          id,
          url: `https://www.youtube.com/watch?v=${id}`,
          title: j.title,
          thumbnail: j.thumbnail_url,
          channel: j.author_name,
          channelUrl: j.author_url,
        })
      }
    } catch {}
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// Stream URL: returns JSON with direct googlevideo URL
app.get('/api/youtube/stream', async (req, res) => {
  const url = req.query.url
  const quality = req.query.quality || '1080'
  const mode = req.query.mode === 'audio' ? 'audio' : 'video'
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing url' })

  try {
    // Use yt-dlp --dump-json to get formats and pick best
    const { stdout } = await runYtDlp(['--dump-json', '--no-playlist', '--no-warnings', url], 25000)
    const data = JSON.parse(stdout)
    const formats = data.formats || []
    // For audio: pick best audio
    if (mode === 'audio') {
      const audios = formats.filter((f) => f.vcodec === 'none' && f.acodec !== 'none' && f.url)
      audios.sort((a, b) => (b.abr || 0) - (a.abr || 0) || (b.tbr || 0) - (a.tbr || 0))
      const best = audios[0]
      if (!best?.url) throw new Error('No audio format found')
      return res.json({ url: best.url, filename: `${data.title || data.id}.m4a`, ext: best.ext || 'm4a' })
    }

    // For video: try to get best mp4 muxed or best video+audio
    // Prefer format with both vcodec and acodec (muxed)
    const targetH = quality === 'max' ? 9999 : parseInt(quality, 10) || 1080
    // Filter video formats with url
    const videos = formats.filter((f) => f.vcodec !== 'none' && f.url)
    // Prefer mp4
    const muxed = videos.filter((f) => f.acodec !== 'none' && f.ext === 'mp4')
    const muxedCandidates = muxed.filter((f) => (f.height || 0) <= targetH)
    muxedCandidates.sort((a, b) => (b.height || 0) - (a.height || 0) || (b.tbr || 0) - (a.tbr || 0))
    if (muxedCandidates[0]?.url) {
      const best = muxedCandidates[0]
      return res.json({ url: best.url, filename: `${data.title || data.id}-${best.height}p.mp4`, ext: 'mp4', height: best.height })
    }
    // Fallback: best video overall (may be video-only, but still downloadable)
    const videoOnly = videos.filter((f) => (f.height || 0) <= targetH)
    videoOnly.sort((a, b) => (b.height || 0) - (a.height || 0) || (b.tbr || 0) - (a.tbr || 0))
    if (videoOnly[0]?.url) {
      const best = videoOnly[0]
      // If video-only, try to use yt-dlp --get-url with merge? But return video-only URL for now
      return res.json({ url: best.url, filename: `${data.title || data.id}-${best.height}p.${best.ext}`, ext: best.ext, height: best.height, note: 'video-only, may need audio merge' })
    }

    // Last resort: use yt-dlp --get-url
    const { stdout: urlOut } = await runYtDlp(['--get-url', '-f', `bestvideo[height<=${targetH}]+bestaudio/best`, '--no-playlist', url], 20000)
    const firstUrl = urlOut.trim().split('\n')[0]
    if (firstUrl) return res.json({ url: firstUrl, filename: `${data.id}.mp4`, ext: 'mp4' })

    throw new Error('No suitable format found')
  } catch (e) {
    console.error('[youtube/stream] error', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// Direct download proxy: streams file with proper Content-Disposition
// Uses yt-dlp to download & merge (handles DASH/HLS), then pipes to client
app.get('/api/youtube/download', async (req, res) => {
  const url = req.query.url
  const quality = req.query.quality || '1080'
  const mode = req.query.mode === 'audio' ? 'audio' : 'video'
  if (!url || typeof url !== 'string') return res.status(400).send('Missing url')

  // Sanitize filename for header
  const safeId = (url.match(/(?:v=|youtu\.be\/|shorts\/)([^&\s?]+)/)?.[1] || 'video').replace(/[^a-zA-Z0-9_-]/g, '_')

  try {
    let args
    let filename
    let contentType

    if (mode === 'audio') {
      // Extract audio as mp3 (or m4a if mp3 fails, ffmpeg will convert)
      filename = `${safeId}.mp3`
      contentType = 'audio/mpeg'
      args = ['-o', '-', '--no-playlist', '--no-warnings', '-x', '--audio-format', 'mp3', '--audio-quality', '0', url]
    } else {
      const height = quality === 'max' ? '9999' : parseInt(quality, 10) || 1080
      // For video, try to get best mp4 muxed up to height, fallback to best
      // yt-dlp will merge video+audio via ffmpeg if needed
      filename = `${safeId}-${height}p.mp4`
      contentType = 'video/mp4'
      // Use format that prefers mp4
      args = [
        '-o',
        '-',
        '--no-playlist',
        '--no-warnings',
        '-f',
        `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`,
        '--merge-output-format',
        'mp4',
        url,
      ]
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-cache')

    const proc = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] })

    let stderr = ''
    proc.stderr.on('data', (d) => (stderr += d.toString()))

    proc.on('error', (err) => {
      console.error('[download] spawn error', err)
      if (!res.headersSent) res.status(500).json({ error: err.message })
      else res.end()
    })

    // Timeout 5 minutes for long videos
    const timeout = setTimeout(() => {
      proc.kill('SIGKILL')
      if (!res.writableEnded) res.status(504).end('Download timeout')
    }, 300000)

    proc.stdout.pipe(res)

    proc.on('close', (code) => {
      clearTimeout(timeout)
      if (code !== 0 && !res.writableEnded) {
        console.error('[download] yt-dlp failed', stderr.slice(0, 2000))
        // If headers already sent, we can't send JSON, just end
        if (!res.headersSent) res.status(500).json({ error: stderr || `yt-dlp exited ${code}` })
        else res.end()
      } else if (!res.writableEnded) {
        res.end()
      }
    })
  } catch (e) {
    console.error('[download] error', e)
    if (!res.headersSent) res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    else res.end()
  }
})

app.listen(PORT, () => {
  console.log(`[server] YouTube proxy listening on http://localhost:${PORT}`)
  console.log(`[server] yt-dlp: ${process.env.YTDLP_PATH || 'yt-dlp'} | ffmpeg: available`)
})
