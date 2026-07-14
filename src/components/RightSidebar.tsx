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
import { Sliders, Maximize, Palette, Sparkles, Download, RefreshCw } from 'lucide-react'
import { useStore } from '../state/store'

export const RightSidebar: React.FC<{
  onExport: () => void
}> = ({ onExport }) => {
  const store = useStore()
  const [activeSection, setActiveSection] = useState<'adjust' | 'transform' | 'effects' | 'export'>('adjust')

  const renderSlider = (
    label: string,
    min: number,
    max: number,
    val: number,
    onChange: (v: number) => void,
    step = 1,
    suffix = ''
  ) => {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400 font-medium">{label}</span>
          <span className="text-neutral-200 font-semibold">
            {val.toFixed(step >= 1 ? 0 : 2)}
            {suffix}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>
    )
  }

  return (
    <aside className="w-80 h-full bg-black border-l border-neutral-800 flex flex-col select-none">
      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        {(['adjust', 'transform', 'effects', 'export'] as const).map((sec) => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeSection === sec
                ? 'text-white border-b-2 border-white bg-neutral-900/20'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Main body scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeSection === 'adjust' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Mask Adjustments
            </h3>

            {renderSlider('Luminance Threshold', 0, 255, store.threshold, store.setThreshold)}
            {renderSlider('Mask Feather', 0, 100, store.feather, store.setFeather)}

            <div className="pt-3 border-t border-neutral-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Video Opacities</h3>
              {renderSlider('White Layer Opacity', 0, 1, store.whiteOpacity, store.setWhiteOpacity, 0.01, 'x')}
              {renderSlider('Black Layer Opacity', 0, 1, store.blackOpacity, store.setBlackOpacity, 0.01, 'x')}
            </div>
          </div>
        )}

        {activeSection === 'transform' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Maximize className="w-3.5 h-3.5" /> Layer UV Transforms
            </h3>

            {renderSlider('White Scale', 0.1, 5, store.scale, store.setScale, 0.05)}
            {renderSlider('Offset X', -1, 1, store.offsetX, store.setOffsetX, 0.01)}
            {renderSlider('Offset Y', -1, 1, store.offsetY, store.setOffsetY, 0.01)}
            {renderSlider('Rotation', 0, 360, store.rotation, store.setRotation, 1, '°')}

            {/* Tiling / Duplication */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Duplicate / Tile</span>
              <div className="grid grid-cols-4 gap-1">
                {([1, 2, 4, 8] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => store.setWhiteTiling(t)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      store.whiteTiling === t
                        ? 'border-white bg-white/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {t}x{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Mirror and Flip */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => store.setMirror(!store.mirror)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  store.mirror
                    ? 'border-white bg-white/10 text-white'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                Mirror Horizontal
              </button>
              <button
                onClick={() => store.setFlip(!store.flip)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  store.flip
                    ? 'border-white bg-white/10 text-white'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                Flip Vertical
              </button>
            </div>
          </div>
        )}

        {activeSection === 'effects' && (
          <div className="space-y-5">
            {/* Color adjustments */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Color Grading
              </h3>
              {renderSlider('Brightness', -1, 1, store.effects.brightness, (v) => store.updateEffect('brightness', v), 0.02)}
              {renderSlider('Contrast', -1, 1, store.effects.contrast, (v) => store.updateEffect('contrast', v), 0.02)}
              {renderSlider('Saturation', -1, 1, store.effects.saturation, (v) => store.updateEffect('saturation', v), 0.02)}
              {renderSlider('Hue Rotation', -180, 180, store.effects.hue, (v) => store.updateEffect('hue', v), 1, '°')}
            </div>

            {/* Visual filters */}
            <div className="pt-3 border-t border-neutral-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Creative Filters
              </h3>
              {renderSlider('Edge Glow', 0, 1, store.effects.edgeGlow, (v) => store.updateEffect('edgeGlow', v), 0.02)}
              {renderSlider('Outline Overlay', 0, 1, store.effects.outline, (v) => store.updateEffect('outline', v), 0.02)}
              {renderSlider('Box Blur', 0, 1, store.effects.blur, (v) => store.updateEffect('blur', v), 0.02)}
              {renderSlider('Pixelation Size', 1, 100, store.effects.pixelation, (v) => store.updateEffect('pixelation', v), 1)}
              {renderSlider('Chromatic Aberration', 0, 1, store.effects.chromaticAberration, (v) => store.updateEffect('chromaticAberration', v), 0.02)}
            </div>

            <button
              onClick={() => store.resetEffects()}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-400 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        )}

        {activeSection === 'export' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export Configuration
            </h3>

            {/* Quality Select */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Resolution</span>
              <div className="grid grid-cols-2 gap-2">
                {(['720p', '1080p', '1440p', '4k'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => store.setExportQuality(q)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      store.exportQuality === q
                        ? 'border-white bg-white/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {q.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Select */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Output Format</span>
              <div className="grid grid-cols-2 gap-2">
                {(['webm', 'mp4'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => store.setExportFormat(fmt)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      store.exportFormat === fmt
                        ? 'border-white bg-white/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Export Button */}
            <div className="pt-4">
              <button
                onClick={onExport}
                disabled={store.isExporting || (!store.maskVideo.isLoaded && !store.whiteVideo.isLoaded && !store.blackVideo.isLoaded)}
                className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {store.isExporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Start Render (Ctrl+E)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
