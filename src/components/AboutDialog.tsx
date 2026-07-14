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
import { X, Shield, ExternalLink } from 'lucide-react'
import { useStore } from '../state/store'

export const AboutDialog: React.FC = () => {
  const isOpen = useStore((state) => state.aboutOpen)
  const setOpen = useStore((state) => state.setAboutOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 text-rose-500 rounded-lg bg-rose-500/10">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">About</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500">
              Video Mask Composer
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-400">Version 1.0</p>
          </div>

          <div className="p-4 bg-gray-950/50 border border-gray-800/50 rounded-xl space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Created by</span>
              <span className="font-semibold text-white">Frosty</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Author</span>
              <span className="font-semibold text-white">Iyad Nouasra</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <a
                href="mailto:iyad@heyfrosty.space"
                className="font-medium text-rose-400 hover:text-rose-300 transition-colors"
              >
                iyad@heyfrosty.space
              </a>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GitHub</span>
              <a
                href="https://github.com/enafrosty"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                github.com/enafrosty
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500">
            © 2026 Frosty. All rights reserved. Licensed under MIT.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-800 bg-gray-950/40">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
