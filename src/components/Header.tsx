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

import React, { useState } from 'react'
import { HelpCircle, Keyboard } from 'lucide-react'
import { useStore } from '../state/store'

export const Header: React.FC = () => {
  const setAboutOpen = useStore((state) => state.setAboutOpen)
  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <header className="h-14 bg-black border-b border-neutral-800 px-6 flex items-center justify-between select-none">
      {/* Brand — text only, no logo */}
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-sm tracking-tight text-white">Apple Anything</span>
        <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Editor</span>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {/* Shortcuts Panel Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className={`p-2 rounded-lg border text-neutral-400 hover:text-white transition-colors ${
              showShortcuts ? 'bg-neutral-900 border-neutral-700 text-white' : 'border-transparent hover:bg-neutral-900'
            }`}
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4.5 h-4.5" />
          </button>

          {showShortcuts && (
            <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-700 shadow-2xl rounded-xl p-4 z-50">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Shortcuts</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Play / Pause</span>
                  <kbd className="px-1.5 py-0.5 bg-black border border-neutral-700 rounded font-mono text-[10px] text-neutral-300">Space</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Seek Frame</span>
                  <kbd className="px-1.5 py-0.5 bg-black border border-neutral-700 rounded font-mono text-[10px] text-neutral-300">Arrow Keys</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Export Output</span>
                  <kbd className="px-1.5 py-0.5 bg-black border border-neutral-700 rounded font-mono text-[10px] text-neutral-300">Ctrl + E</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Clear Active Video</span>
                  <kbd className="px-1.5 py-0.5 bg-black border border-neutral-700 rounded font-mono text-[10px] text-neutral-300">Delete</kbd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* About Dialog Button */}
        <button
          onClick={() => setAboutOpen(true)}
          className="p-2 rounded-lg border border-transparent hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          title="About Apple Anything"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  )
}
