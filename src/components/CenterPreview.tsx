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

import React from 'react'
import { Loader2 } from 'lucide-react'
import { useStore } from '../state/store'

interface CenterPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export const CenterPreview: React.FC<CenterPreviewProps> = ({ canvasRef }) => {
  const store = useStore()

  const showLoading = !store.maskVideo.isLoaded && !store.whiteVideo.isLoaded && !store.blackVideo.isLoaded

  return (
    <div className="flex-1 relative bg-black flex items-center justify-center p-6 border-b border-neutral-800 overflow-hidden">
      {/* GL Canvas */}
      <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full max-w-full max-h-full object-contain rounded-lg border border-neutral-850 bg-black shadow-2xl transition-all"
        />

        {/* Status Overlay (e.g. if files are not loaded yet) */}
        {showLoading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-4 text-center p-6 select-none border border-neutral-850">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload Loop Tracks to Begin</h2>
              <p className="text-xs text-neutral-400 max-w-xs mt-1">
                Drag-and-drop or select MP4/WebM videos in the left sidebar to overlay layouts.
              </p>
            </div>
          </div>
        )}

        {/* Exporting progress overlay */}
        {store.isExporting && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-lg flex flex-col items-center justify-center gap-5 p-6 border border-neutral-850 select-none z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div className="text-center space-y-1.5 max-w-sm w-full">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-semibold uppercase tracking-wider">Exporting...</span>
                <span className="text-white font-bold">{store.exportProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${store.exportProgress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-300 pt-2 font-medium">{store.exportStatusText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
