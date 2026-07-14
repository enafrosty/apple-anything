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

import React from 'react'
import { Play, Pause, Cpu, Video } from 'lucide-react'
import { useStore } from '../state/store'

interface BottomTimelineProps {
  onSeek: (time: number) => void
}

export const BottomTimeline: React.FC<BottomTimelineProps> = ({ onSeek }) => {
  const store = useStore()

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '00:00.00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor((time % 1) * 100)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
  }

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value)
    store.setGlobalTime(targetTime)
    onSeek(targetTime)
  }

  return (
    <div className="h-20 bg-gray-950 border-t border-gray-900 px-6 py-3 flex flex-col justify-between select-none">
      {/* Scrubber slider */}
      <div className="flex items-center gap-3 w-full group">
        <span className="text-[10px] font-mono text-gray-500 w-16">
          {formatTime(store.globalTime)}
        </span>
        <input
          type="range"
          min={0}
          max={store.globalDuration || 10}
          step={0.01}
          value={store.globalTime}
          onChange={handleScrubberChange}
          disabled={!store.globalDuration}
          className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-40 disabled:cursor-not-allowed group-hover:scale-y-110 transition-transform"
        />
        <span className="text-[10px] font-mono text-gray-500 w-16 text-right">
          {formatTime(store.globalDuration)}
        </span>
      </div>

      {/* Info elements */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <button
            onClick={() => store.setPlaying(!store.isPlaying)}
            disabled={!store.globalDuration}
            className="flex items-center gap-1.5 hover:text-white transition-colors disabled:opacity-30"
          >
            {store.isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-500" />
                <span>Pause (Space)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-rose-500 fill-current" />
                <span>Play (Space)</span>
              </>
            )}
          </button>
        </div>

        {/* Diagnostic counters */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Video className="w-3.5 h-3.5" />
            <span>Frame: <strong className="font-semibold text-gray-300">{store.frameNumber}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500">
            <Cpu className="w-3.5 h-3.5" />
            <span>FPS: <strong className={`font-semibold ${store.fps >= 55 ? 'text-emerald-400' : 'text-amber-400'}`}>{store.fps}</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}
