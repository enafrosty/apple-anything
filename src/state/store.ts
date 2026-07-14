/*
 * Video Mask Composer
 * Copyright (c) 2026 Frosty
 *
 * Author: Iyad Nouasra (Frosty)
 * Email: iyad@heyfrosty.space
 * GitHub: https://github.com/enafrosty
 *
 * Licensed under the MIT License.
 */

import { create } from 'zustand'

export interface VideoState {
  file: File | null
  url: string | null
  duration: number
  currentTime: number
  isLoaded: boolean
  width: number
  height: number
}

export interface CompositingEffects {
  edgeGlow: number // 0 to 1
  outline: number // 0 to 1
  blur: number // 0 to 1
  pixelation: number // 1 to 100 (1 is normal)
  chromaticAberration: number // 0 to 1
  brightness: number // -1 to 1 (0 is neutral)
  contrast: number // -1 to 1 (0 is neutral)
  saturation: number // -1 to 1 (0 is neutral)
  hue: number // -180 to 180 (0 is neutral)
}

export interface CompositorState {
  // Video inputs
  maskVideo: VideoState
  whiteVideo: VideoState
  blackVideo: VideoState

  // Global playback controls
  isPlaying: boolean
  playbackSpeed: number
  isMuted: boolean
  isLooping: boolean
  globalTime: number
  globalDuration: number
  fps: number
  frameNumber: number

  // Composition parameters
  threshold: number // 0 to 255
  feather: number // 0 to 100
  whiteOpacity: number // 0.0 to 1.0
  blackOpacity: number // 0.0 to 1.0
  scale: number
  offsetX: number
  offsetY: number
  rotation: number // degrees (0-360)
  mirror: boolean // horizontal flip
  flip: boolean // vertical flip
  loopMode: 'loop' | 'bounce' | 'once'
  exportQuality: '720p' | '1080p' | '1440p' | '4k'
  exportFormat: 'webm' | 'mp4'

  // Selection
  selectedTrack: 'mask' | 'white' | 'black' | null

  // GPU shader effects
  effects: CompositingEffects

  // UI state
  aboutOpen: boolean
  isExporting: boolean
  exportProgress: number
  exportStatusText: string

  // Actions
  setVideo: (type: 'mask' | 'white' | 'black', file: File | null, url: string | null) => void
  updateVideoMetadata: (type: 'mask' | 'white' | 'black', duration: number, width: number, height: number) => void
  updateVideoTime: (type: 'mask' | 'white' | 'black', currentTime: number) => void
  setSelectedTrack: (track: 'mask' | 'white' | 'black' | null) => void
  setPlaying: (isPlaying: boolean) => void
  setPlaybackSpeed: (speed: number) => void
  setMuted: (isMuted: boolean) => void
  setLooping: (isLooping: boolean) => void
  setGlobalTime: (time: number) => void
  setGlobalDuration: (duration: number) => void
  setFps: (fps: number) => void
  setFrameNumber: (frame: number) => void
  setThreshold: (threshold: number) => void
  setFeather: (feather: number) => void
  setWhiteOpacity: (opacity: number) => void
  setBlackOpacity: (opacity: number) => void
  setScale: (scale: number) => void
  setOffsetX: (x: number) => void
  setOffsetY: (y: number) => void
  setRotation: (deg: number) => void
  setMirror: (mirror: boolean) => void
  setFlip: (flip: boolean) => void
  setLoopMode: (mode: 'loop' | 'bounce' | 'once') => void
  setExportQuality: (quality: '720p' | '1080p' | '1440p' | '4k') => void
  setExportFormat: (format: 'webm' | 'mp4') => void
  updateEffect: (effectName: keyof CompositingEffects, value: number) => void
  resetEffects: () => void
  setAboutOpen: (open: boolean) => void
  setExporting: (exporting: boolean) => void
  setExportProgress: (progress: number) => void
  setExportStatusText: (text: string) => void
  resetStore: () => void
}

const initialVideoState = (): VideoState => ({
  file: null,
  url: null,
  duration: 0,
  currentTime: 0,
  isLoaded: false,
  width: 0,
  height: 0,
})

const initialEffects = (): CompositingEffects => ({
  edgeGlow: 0,
  outline: 0,
  blur: 0,
  pixelation: 1,
  chromaticAberration: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
})

export const useStore = create<CompositorState>((set, get) => ({
  maskVideo: initialVideoState(),
  whiteVideo: initialVideoState(),
  blackVideo: initialVideoState(),

  isPlaying: false,
  playbackSpeed: 1.0,
  isMuted: true,
  isLooping: true,
  globalTime: 0,
  globalDuration: 0,
  fps: 0,
  frameNumber: 0,

  threshold: 128,
  feather: 10,
  whiteOpacity: 1.0,
  blackOpacity: 1.0,
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  mirror: false,
  flip: false,
  loopMode: 'loop',
  exportQuality: '1080p',
  exportFormat: 'mp4',

  selectedTrack: null,

  effects: initialEffects(),

  aboutOpen: false,
  isExporting: false,
  exportProgress: 0,
  exportStatusText: '',

  setVideo: (type, file, url) => {
    // Revoke old URL if generated internally
    const prevUrl = get()[`${type}Video`].url
    if (prevUrl && prevUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl)
    }

    set(() => ({
      [`${type}Video`]: {
        file,
        url,
        duration: 0,
        currentTime: 0,
        isLoaded: false,
        width: 0,
        height: 0,
      },
    }))

    // Recompute global duration based on the videos
    setTimeout(() => {
      const state = get()
      const maxDuration = Math.max(
        state.maskVideo.duration,
        state.whiteVideo.duration,
        state.blackVideo.duration
      )
      set({ globalDuration: maxDuration })
    }, 100)
  },

  updateVideoMetadata: (type, duration, width, height) => {
    set((state) => ({
      [`${type}Video`]: {
        ...state[`${type}Video`],
        duration,
        width,
        height,
        isLoaded: true,
      },
    }))

    const state = get()
    const maxDuration = Math.max(
      state.maskVideo.duration,
      state.whiteVideo.duration,
      state.blackVideo.duration
    )
    set({ globalDuration: maxDuration })
  },

  updateVideoTime: (type, currentTime) => {
    set((state) => ({
      [`${type}Video`]: {
        ...state[`${type}Video`],
        currentTime,
      },
    }))

    // If mask is updated, update global time
    if (type === 'mask') {
      set({ globalTime: currentTime })
    }
  },

  setSelectedTrack: (selectedTrack) => set({ selectedTrack }),

  setPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setMuted: (isMuted) => set({ isMuted }),
  setLooping: (isLooping) => set({ isLooping }),
  setGlobalTime: (globalTime) => set({ globalTime }),
  setGlobalDuration: (globalDuration) => set({ globalDuration }),
  setFps: (fps) => set({ fps }),
  setFrameNumber: (frameNumber) => set({ frameNumber }),
  setThreshold: (threshold) => set({ threshold }),
  setFeather: (feather) => set({ feather }),
  setWhiteOpacity: (whiteOpacity) => set({ whiteOpacity }),
  setBlackOpacity: (blackOpacity) => set({ blackOpacity }),
  setScale: (scale) => set({ scale }),
  setOffsetX: (offsetX) => set({ offsetX }),
  setOffsetY: (offsetY) => set({ offsetY }),
  setRotation: (rotation) => set({ rotation }),
  setMirror: (mirror) => set({ mirror }),
  setFlip: (flip) => set({ flip }),
  setLoopMode: (loopMode) => set({ loopMode }),
  setExportQuality: (exportQuality) => set({ exportQuality }),
  setExportFormat: (exportFormat) => set({ exportFormat }),

  updateEffect: (effectName, value) =>
    set((state) => ({
      effects: {
        ...state.effects,
        [effectName]: value,
      },
    })),

  resetEffects: () => set({ effects: initialEffects() }),
  setAboutOpen: (aboutOpen) => set({ aboutOpen }),
  setExporting: (isExporting) => set({ isExporting }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  setExportStatusText: (exportStatusText) => set({ exportStatusText }),

  resetStore: () => {
    // Revoke all URLs
    const state = get()
    ;(['mask', 'white', 'black'] as const).forEach((t) => {
      const u = state[`${t}Video`].url
      if (u && u.startsWith('blob:')) {
        URL.revokeObjectURL(u)
      }
    })

    set({
      maskVideo: initialVideoState(),
      whiteVideo: initialVideoState(),
      blackVideo: initialVideoState(),
      isPlaying: false,
      playbackSpeed: 1.0,
      isMuted: true,
      isLooping: true,
      globalTime: 0,
      globalDuration: 0,
      fps: 0,
      frameNumber: 0,
      threshold: 128,
      feather: 10,
      whiteOpacity: 1.0,
      blackOpacity: 1.0,
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      mirror: false,
      flip: false,
      loopMode: 'loop',
      exportQuality: '1080p',
      exportFormat: 'mp4',
      selectedTrack: null,
      effects: initialEffects(),
      aboutOpen: false,
      isExporting: false,
      exportProgress: 0,
      exportStatusText: '',
    })
  },
}))
