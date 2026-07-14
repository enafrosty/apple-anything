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

export const Footer: React.FC = () => (
  <footer className="h-8 bg-gray-950 border-t border-gray-900 flex items-center justify-center text-[10px] text-gray-600 tracking-wide select-none">
    Made with ❤️ by{' '}
    <a
      href="https://github.com/enafrosty"
      target="_blank"
      rel="noopener noreferrer"
      className="ml-1 text-rose-500 hover:text-rose-400 font-semibold transition-colors"
    >
      Frosty
    </a>
  </footer>
)
