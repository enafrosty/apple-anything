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

import React, { useRef } from 'react'
import { Upload, FileVideo, CheckCircle, Video, Volume2, VolumeX, RotateCcw, Play, Pause } from 'lucide-react'
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
  }

  const renderUploadCard = (
    type: 'mask' | 'white' | 'black',
    title: string,
    colorClass: string,
    ref: React.RefObject<HTMLInputElement | null>,
    videoState: VideoState
  ) => {
    return (
      <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</span>
          {videoState.isLoaded ? (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" /> Ready
            </span>
          ) : (
            <span className="text-xs text-gray-600">Empty</span>
          )}
        </div>

        <input
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          ref={ref}
          onChange={(e) => handleFileChange(type, e)}
          className="hidden"
        />

        {videoState.isLoaded ? (
          <div className="p-3 bg-gray-950 rounded-lg border border-gray-850 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${colorClass}-500/10 text-${colorClass}-400`}>
              <FileVideo className="w-5 h-5" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-medium text-gray-200 truncate">{videoState.file?.name || 'Uploaded Video'}</p>
              <p className="text-[10px] text-gray-500">
                {videoState.width}x{videoState.height} • {videoState.duration.toFixed(1)}s
              </p>
            </div>
            <button
              onClick={() => store.setVideo(type, null, null)}
              className="text-[10px] text-rose-500 hover:text-rose-400 font-semibold px-2 py-1 hover:bg-rose-500/10 rounded transition-colors"
            >
              Clear
            </button>
          </div>
        ) : (
          <button
            onClick={() => ref.current?.click()}
            className="w-full py-6 px-4 bg-gray-950 border border-dashed border-gray-800 hover:border-rose-500/50 rounded-lg flex flex-col items-center justify-center gap-2 group transition-all"
          >
            <div className="p-2 rounded-lg bg-gray-900 group-hover:scale-105 transition-transform text-gray-400 group-hover:text-rose-400">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200">
              Upload MP4 / WebM
            </span>
          </button>
        )}
      </div>
    )
  }

  return (
    <aside className="w-80 h-full bg-gray-950 border-r border-gray-900 flex flex-col select-none">
      {/* Title */}
      <div className="p-4 border-b border-gray-900 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
          <Video className="w-4 h-4 text-rose-500" /> Upload Channels
        </span>
      </div>

      {/* Upload Blocks */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderUploadCard('mask', 'Luminance Mask Video', 'rose', maskInputRef, store.maskVideo)}
        {renderUploadCard('white', 'White Layer Video', 'purple', whiteInputRef, store.whiteVideo)}
        {renderUploadCard('black', 'Black Layer Video', 'indigo', blackInputRef, store.blackVideo)}
      </div>

      {/* Playback controls container */}
      <div className="p-4 border-t border-gray-900 bg-gray-900/20 space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => store.setPlaying(!store.isPlaying)}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              store.isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/10'
                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/10'
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
            className={`p-2 rounded-lg border border-gray-800 transition-colors ${
              store.isMuted ? 'text-gray-500 hover:text-white bg-gray-900' : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
            }`}
            title="Mute Loop Tracks"
          >
            {store.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => store.setGlobalTime(0)}
            className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
            title="Restart Timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Playback Speed</span>
          <div className="grid grid-cols-5 gap-1">
            {([0.25, 0.5, 1.0, 1.5, 2.0] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => store.setPlaybackSpeed(spd)}
                className={`py-1 text-[10px] font-semibold rounded transition-colors ${
                  store.playbackSpeed === spd
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Sync loop toggles */}
        <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-950/40 p-2.5 rounded-lg border border-gray-900">
          <span>Auto Loop tracks</span>
          <input
            type="checkbox"
            checked={store.isLooping}
            onChange={(e) => store.setLooping(e.target.checked)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-rose-500 focus:ring-rose-500"
          />
        </div>
      </div>
    </aside>
  )
}
