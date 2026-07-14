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
import { X, Shield, ExternalLink } from 'lucide-react'
import { useStore } from '../state/store'

export const AboutDialog: React.FC = () => {
  const isOpen = useStore((state) => state.aboutOpen)
  const setOpen = useStore((state) => state.setAboutOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 text-white rounded-lg bg-white/10">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">About</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-neutral-400 transition-colors rounded-lg hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-white">
              Apple Anything
            </h1>
            <p className="mt-1 text-sm font-medium text-neutral-400">Version 1.0</p>
          </div>

          <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Created by</span>
              <span className="font-semibold text-white">Frosty</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Author</span>
              <span className="font-semibold text-white">Iyad Nouasra</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Email</span>
              <a
                href="mailto:iyad@heyfrosty.space"
                className="font-medium text-white hover:text-neutral-300 transition-colors"
              >
                iyad@heyfrosty.space
              </a>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">GitHub</span>
              <a
                href="https://github.com/enafrosty"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-medium text-white hover:text-neutral-300 transition-colors"
              >
                github.com/enafrosty
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <p className="text-xs text-center text-neutral-500">
            © 2026 Frosty. All rights reserved. Licensed under MIT.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-neutral-800 bg-neutral-950/40">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
