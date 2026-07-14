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

import React, { useState } from 'react'
import { Video, HelpCircle, Keyboard } from 'lucide-react'
import { useStore } from '../state/store'

export const Header: React.FC = () => {
  const setAboutOpen = useStore((state) => state.setAboutOpen)
  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <header className="h-14 bg-gray-950 border-b border-gray-900 px-6 flex items-center justify-between select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/10">
          <Video className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold text-sm tracking-tight text-white">Video Mask Composer</span>
          <span className="text-[10px] ml-2 text-gray-500 font-semibold uppercase tracking-wider">Editor</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {/* Shortcuts Panel Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className={`p-2 rounded-lg border text-gray-400 hover:text-white transition-colors ${
              showShortcuts ? 'bg-gray-900 border-gray-800 text-white' : 'border-transparent hover:bg-gray-900'
            }`}
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4.5 h-4.5" />
          </button>

          {showShortcuts && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-850 shadow-2xl rounded-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Shortcuts</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Play / Pause</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-950 border border-gray-800 rounded font-mono text-[10px] text-gray-300">Space</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Seek Frame</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-950 border border-gray-800 rounded font-mono text-[10px] text-gray-300">Arrow Keys</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Export Output</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-950 border border-gray-800 rounded font-mono text-[10px] text-gray-300">Ctrl + E</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Clear Active Video</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-950 border border-gray-800 rounded font-mono text-[10px] text-gray-300">Delete</kbd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* About Dialog Button */}
        <button
          onClick={() => setAboutOpen(true)}
          className="p-2 rounded-lg border border-transparent hover:bg-gray-900 text-gray-400 hover:text-white transition-colors"
          title="About Video Mask Composer"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  )
}
