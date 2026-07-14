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
import { Header } from './components/Header'
import { LeftSidebar } from './components/LeftSidebar'
import { RightSidebar } from './components/RightSidebar'
import { CenterPreview } from './components/CenterPreview'
import { BottomTimeline } from './components/BottomTimeline'
import { Footer } from './components/Footer'
import { AboutDialog } from './components/AboutDialog'
import { useRenderer } from './hooks/useRenderer'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import './index.css'

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { seek, startExport } = useRenderer(canvasRef)

  // Register keyboard shortcuts
  useKeyboardShortcuts(seek, startExport)

  return (
    <div className="flex flex-col w-full h-screen bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main layout: left sidebar | centre preview | right sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />

        {/* Centre column: preview + timeline */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <CenterPreview canvasRef={canvasRef} />
          <BottomTimeline onSeek={seek} />
        </div>

        <RightSidebar onExport={startExport} />
      </div>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AboutDialog />
    </div>
  )
}

export default App
