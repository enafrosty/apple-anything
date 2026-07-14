# Video Mask Composer

A GPU-accelerated browser application for compositing looping videos using luminance masks.

Created by **Frosty**.

GitHub: [https://github.com/enafrosty](https://github.com/enafrosty)

Contact: [iyad@heyfrosty.space](mailto:iyad@heyfrosty.space)

---

## Overview

Video Mask Composer lets you overlay two looping videos using a black-and-white mask video as a luminance key. White regions of the mask reveal one video, black regions reveal another — all composited in real time on the GPU using WebGL shaders.

### Key Features

- **Real-time WebGL compositing** — 60 FPS at 1080p with minimal CPU usage.
- **Luminance masking** — adjustable threshold and feathered transitions.
- **UV transforms** — scale, offset, rotation, mirror, and flip per layer.
- **Creative filters** — edge glow, outline, blur, pixelation, chromatic aberration.
- **Colour grading** — brightness, contrast, saturation, hue rotation.
- **FFmpeg.wasm export** — render to MP4 or WebM at 720p / 1080p / 1440p / 4K.
- **Keyboard shortcuts** — Space (play/pause), Arrow keys (seek), Ctrl+E (export).
- **Independent looping** — each video loops at its own duration.

---

## Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

> **Note:** FFmpeg.wasm requires `Cross-Origin-Opener-Policy: same-origin` and
> `Cross-Origin-Embedder-Policy: require-corp` headers. These are preconfigured
> in the Vite dev server (`vite.config.ts`).

---

## Architecture

```
src/
├── components/        React UI components
│   ├── AboutDialog    Project information modal
│   ├── BottomTimeline Scrubber, frame & FPS counters
│   ├── CenterPreview  WebGL canvas wrapper
│   ├── Footer         Branding
│   ├── Header         Top bar with shortcuts overlay
│   ├── LeftSidebar    Video uploads & playback controls
│   └── RightSidebar   Mask / transform / effects / export tabs
├── hooks/             Custom React hooks
│   ├── useKeyboardShortcuts   Global keyboard event handler
│   └── useRenderer            WebGL renderer lifecycle bridge
├── renderer/          GPU rendering pipeline (no React dependencies)
│   ├── ExportPipeline         FFmpeg.wasm frame capture & encoding
│   ├── FrameClock             FPS measurement & frame counter
│   ├── MaskPass               Full-screen composite draw call
│   ├── Renderer               Top-level WebGL orchestrator
│   ├── RenderLoop             requestAnimationFrame wrapper
│   ├── ShaderManager          GLSL compilation & uniform cache
│   ├── TextureManager         Video texture lifecycle manager
│   ├── VideoTexture           HTML5 <video> ↔ WebGL texture bridge
│   └── shaders.ts             GLSL vertex & fragment source code
└── state/             Zustand store (single source of truth)
    └── store.ts
```

### Rendering pipeline

1. `RenderLoop` fires on every animation frame.
2. `TextureManager` uploads decoded video frames as GPU textures.
3. `MaskPass` binds textures, sets uniforms, and draws a full-screen quad.
4. The fragment shader computes luminance masking, UV transforms, compositing,
   edge effects, and colour grading in a single pass.
5. `FrameClock` measures FPS and updates the Zustand store.

### Export pipeline

1. An offscreen `<canvas>` + WebGL context is created at the target resolution.
2. Each frame is seeked, rendered, and captured as a JPEG blob.
3. Blobs are written to FFmpeg.wasm's virtual filesystem.
4. FFmpeg encodes the image sequence into an MP4 or WebM container.
5. The resulting file is downloaded to the user's machine.

---

## Future Extension Points

The renderer is designed so it can later support:

- Additional brightness ranges (4, 8, N-way masking)
- RGB / chroma key / alpha masking
- Webcam & screen capture inputs
- Audio-reactive masks
- Animated shader effects
- Timeline markers & presets
- Undo/redo history
- Project save/load as JSON

---

## Credits

Designed and developed by **Frosty**.

## License

MIT License

Copyright (c) 2026 Frosty
