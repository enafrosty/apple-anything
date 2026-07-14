/*
 * Apple Anything
 * Copyright (c) 2026 Frosty
 *
 * Author: Iyad Nouasra (Frosty)
 * Email: iyad@heyfrosty.space
 * GitHub: https://github.com/enafrosty
 *
 * Licensed under the MIT License.
 */

import React, { useRef } from 'react'
import { Upload, FileVideo, Volume2, VolumeX, RotateCcw, Play, Pause } from 'lucide-react'
import { useStore, type VideoState } from '../state/store'

export const LeftSidebar: React.FC = () => {
  const store = useStore()
  const maskInputRef = useRef<HTMLInputElement>(null)
  const whiteInputRef = useRef<HTMLInputElement>(null)
  const blackInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (type: 'mask' | 'white' | 'black', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      store.setVideo(type, file, url)
    }
    e.target.value = ''
  }

  const renderUploadCard = (
    type: 'mask' | 'white' | 'black',
    title: string,
    ref: React.RefObject<HTMLInputElement | null>,
    videoState: VideoState
  ) => {
    const isMuted = type === 'white' ? store.whiteMuted : type === 'black' ? store.blackMuted : true
    const toggleMute = () => {
      if (type === 'white') store.setWhiteMuted(!store.whiteMuted)
      if (type === 'black') store.setBlackMuted(!store.blackMuted)
    }

    return (
      <div key={type}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{title}</span>
        </div>
        <input
          ref={ref}
          type="file"
          accept="video/mp4,video/webm,video/*"
          className="hidden"
          onChange={(e) => handleFileChange(type, e)}
        />
        {videoState.isLoaded ? (
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 text-neutral-400">
              <FileVideo className="w-5 h-5" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-medium text-neutral-200 truncate">{videoState.file?.name || 'Uploaded Video'}</p>
              <p className="text-[10px] text-neutral-500">
                {videoState.width}x{videoState.height} • {videoState.duration.toFixed(1)}s
              </p>
            </div>
            {/* Per-track mute (not for mask) */}
            {type !== 'mask' && (
              <button
                onClick={toggleMute}
                className={`p-1.5 rounded-lg transition-colors ${
                  isMuted ? 'text-neutral-600 hover:text-neutral-300' : 'text-white bg-white/10'
                }`}
                title={isMuted ? 'Unmute track audio' : 'Mute track audio'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              onClick={() => store.setVideo(type, null, null)}
              className="text-[10px] text-neutral-500 hover:text-white font-semibold px-2 py-1 hover:bg-white/5 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        ) : (
          <button
            onClick={() => ref.current?.click()}
            className="w-full py-6 px-4 bg-black border border-dashed border-neutral-800 hover:border-neutral-500 rounded-lg flex flex-col items-center justify-center gap-2 group transition-all"
          >
            <div className="p-2 rounded-lg bg-neutral-900 group-hover:scale-105 transition-transform text-neutral-500 group-hover:text-white">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-200">
              Upload MP4 / WebM
            </span>
          </button>
        )}
      </div>
    )
  }

  return (
    <aside className="w-80 h-full bg-black border-r border-neutral-800 flex flex-col select-none">
      {/* Title */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-sm font-bold text-neutral-200 flex items-center gap-2">
          Upload Channels
        </span>
      </div>

      {/* Upload Blocks */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderUploadCard('mask', 'Luminance Mask Video', maskInputRef, store.maskVideo)}
        {renderUploadCard('white', 'White Layer Video', whiteInputRef, store.whiteVideo)}
        {renderUploadCard('black', 'Black Layer Video', blackInputRef, store.blackVideo)}
      </div>

      {/* Playback controls container */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950 space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => store.setPlaying(!store.isPlaying)}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              store.isPlaying
                ? 'bg-white text-black hover:bg-neutral-200'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {store.isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play
              </>
            )}
          </button>

          <button
            onClick={() => store.setMuted(!store.isMuted)}
            className={`p-2 rounded-lg border border-neutral-800 transition-colors ${
              store.isMuted ? 'text-neutral-500 hover:text-white bg-neutral-900' : 'text-white bg-white/10 hover:bg-white/20'
            }`}
            title="Master Mute"
          >
            {store.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => store.setGlobalTime(0)}
            className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            title="Restart Timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Playback Speed</span>
          <div className="grid grid-cols-5 gap-1">
            {([0.25, 0.5, 1.0, 1.5, 2.0] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => store.setPlaybackSpeed(spd)}
                className={`py-1 text-[10px] font-semibold rounded transition-colors ${
                  store.playbackSpeed === spd
                    ? 'bg-white text-black font-bold'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Sync loop toggles */}
        <div className="flex items-center justify-between text-xs text-neutral-400 bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-800">
          <span>Auto Loop tracks</span>
          <input
            type="checkbox"
            checked={store.isLooping}
            onChange={(e) => store.setLooping(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-white"
          />
        </div>
      </div>
    </aside>
  )
}
