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

/**
 * Vertex shader — passes through a full-screen quad with UV coordinates.
 */
export const VERTEX_SHADER_SOURCE = `
  attribute vec2 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vUv;

  void main() {
    vUv = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

/**
 * Fragment shader — composites mask, white-layer and black-layer videos.
 *
 * Pipeline:
 *   1. Pixelation (optional)
 *   2. Sample mask → compute luminance → threshold + feather → alpha
 *   3. Sample white-layer (with UV transforms + chromatic aberration)
 *   4. Sample black-layer
 *   5. Composite: mix(black * blackOpacity, white * whiteOpacity, alpha)
 *   6. Edge glow / outline (Sobel on mask)
 *   7. Colour grading (brightness, contrast, saturation, hue)
 */
export const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  varying vec2 vUv;

  // ── Textures ──
  uniform sampler2D uMaskTex;
  uniform sampler2D uWhiteTex;
  uniform sampler2D uBlackTex;

  // Flags for texture presence
  uniform bool uHasMask;
  uniform bool uHasWhite;
  uniform bool uHasBlack;

  // Dimensions
  uniform vec2 uTextureSize;

  // ── Compositing parameters ──
  uniform float uThreshold;            // 0.0 – 1.0
  uniform float uFeather;              // 0.0 – 1.0
  uniform float uWhiteOpacity;         // 0.0 – 1.0
  uniform float uBlackOpacity;         // 0.0 – 1.0

  // White-video UV transforms
  uniform float uWhiteScale;
  uniform vec2  uWhiteOffset;
  uniform float uWhiteRotation;        // radians
  uniform bool  uWhiteMirror;
  uniform bool  uWhiteFlip;
  uniform float uWhiteTiling;          // tiling multiplier: 1, 2, 4, 8

  // ── FX parameters ──
  uniform float uEdgeGlow;             // 0.0 – 1.0
  uniform float uOutline;              // 0.0 – 1.0
  uniform float uBlur;                 // 0.0 – 1.0
  uniform float uPixelation;           // 1.0 – 100.0
  uniform float uChromaticAberration;  // 0.0 – 1.0
  uniform float uBrightness;           // -1.0 – 1.0
  uniform float uContrast;             // -1.0 – 1.0
  uniform float uSaturation;           // -1.0 – 1.0
  uniform float uHue;                  // -180.0 – 180.0

  // ────────────────────────── helpers ──────────────────────────

  vec2 transformUV(vec2 uv, vec2 offset, float scale, float rot, bool mirror, bool flip) {
    vec2 st = uv - 0.5;
    if (mirror) st.x = -st.x;
    if (flip)   st.y = -st.y;
    float c = cos(rot);
    float s = sin(rot);
    st = vec2(st.x * c - st.y * s, st.x * s + st.y * c);
    st /= scale;
    st -= offset;
    return st + 0.5;
  }

  vec3 applyColorAdjustments(vec3 col, float bri, float con, float sat, float hueVal) {
    col += bri;
    col = (col - 0.5) * (1.0 + con) + 0.5;

    if (abs(hueVal) > 0.01) {
      float angle = hueVal * 3.14159265 / 180.0;
      float k = 0.57735;
      float ca = cos(angle);
      float sa = sin(angle);
      vec3 kv = vec3(k);
      col = col * ca + cross(kv, col) * sa + kv * dot(kv, col) * (1.0 - ca);
    }

    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, 1.0 + sat);

    return clamp(col, 0.0, 1.0);
  }

  vec4 blurTexture(sampler2D tex, vec2 uv, float amount, vec2 ts) {
    vec4 sum = vec4(0.0);
    float total = 0.0;
    for (float x = -2.0; x <= 2.0; x += 1.0) {
      for (float y = -2.0; y <= 2.0; y += 1.0) {
        vec2 off = vec2(x, y) * ts * amount * 4.0;
        sum += texture2D(tex, uv + off);
        total += 1.0;
      }
    }
    return sum / total;
  }

  // ────────────────────────── main ──────────────────────────

  void main() {
    vec2 ts = 1.0 / (uTextureSize.x > 0.0 ? uTextureSize : vec2(1920.0, 1080.0));
    vec2 uv = vUv;

    // 0. Pixelation
    if (uPixelation > 1.05) {
      uv = floor(uv * uPixelation) / uPixelation;
    }

    // Chromatic-aberration UV shifts
    vec2 rOff = vec2( uChromaticAberration * 0.015, 0.0);
    vec2 gOff = vec2( 0.0, uChromaticAberration * 0.01);
    vec2 bOff = vec2(-uChromaticAberration * 0.015, 0.0);

    // 1. Mask
    vec4 maskColor;
    if (uHasMask) {
      maskColor = (uBlur > 0.0) ? blurTexture(uMaskTex, uv, uBlur, ts)
                                 : texture2D(uMaskTex, uv);
    } else {
      maskColor = vec4(step(0.5, uv.x));
    }

    float lum   = dot(maskColor.rgb, vec3(0.299, 0.587, 0.114));
    float halfF = uFeather * 0.5;
    float lo    = clamp(uThreshold - halfF, 0.0, 1.0);
    float hi    = clamp(uThreshold + halfF, 0.0, 1.0);
    float alpha = (hi - lo > 0.0001) ? smoothstep(lo, hi, lum) : step(uThreshold, lum);

    // 2. White layer (with transforms + tiling)
    vec2 wUV = transformUV(uv, uWhiteOffset, uWhiteScale, uWhiteRotation, uWhiteMirror, uWhiteFlip);
    vec2 tiledWUV = fract(wUV * uWhiteTiling);
    vec4 whiteColor;
    if (uHasWhite) {
      if (uChromaticAberration > 0.0) {
        whiteColor.r = texture2D(uWhiteTex, fract(transformUV(uv + rOff, uWhiteOffset, uWhiteScale, uWhiteRotation, uWhiteMirror, uWhiteFlip) * uWhiteTiling)).r;
        whiteColor.g = texture2D(uWhiteTex, fract(transformUV(uv + gOff, uWhiteOffset, uWhiteScale, uWhiteRotation, uWhiteMirror, uWhiteFlip) * uWhiteTiling)).g;
        whiteColor.b = texture2D(uWhiteTex, fract(transformUV(uv + bOff, uWhiteOffset, uWhiteScale, uWhiteRotation, uWhiteMirror, uWhiteFlip) * uWhiteTiling)).b;
        whiteColor.a = 1.0;
      } else if (uBlur > 0.0) {
        whiteColor = blurTexture(uWhiteTex, tiledWUV, uBlur, ts);
      } else {
        whiteColor = texture2D(uWhiteTex, tiledWUV);
      }
    } else {
      whiteColor = vec4(tiledWUV.x, 0.5 + 0.5 * sin(tiledWUV.y * 6.28), 1.0 - tiledWUV.x, 1.0);
    }

    // 3. Black layer
    vec4 blackColor;
    if (uHasBlack) {
      blackColor = (uBlur > 0.0) ? blurTexture(uBlackTex, uv, uBlur, ts)
                                  : texture2D(uBlackTex, uv);
    } else {
      vec2 grid = step(0.95, fract(uv * 10.0));
      blackColor = vec4(vec3(0.1 + 0.1 * max(grid.x, grid.y)), 1.0);
    }

    // 4. Composite
    vec4 composite = mix(blackColor * uBlackOpacity, whiteColor * uWhiteOpacity, alpha);

    // 5. Edge glow / outline (Sobel on mask luminance)
    if (uHasMask && (uOutline > 0.0 || uEdgeGlow > 0.0)) {
      float sz = 2.0;
      float mT = dot(texture2D(uMaskTex, uv + vec2( 0.0,-1.0) * ts * sz).rgb, vec3(0.299, 0.587, 0.114));
      float mL = dot(texture2D(uMaskTex, uv + vec2(-1.0, 0.0) * ts * sz).rgb, vec3(0.299, 0.587, 0.114));
      float mR = dot(texture2D(uMaskTex, uv + vec2( 1.0, 0.0) * ts * sz).rgb, vec3(0.299, 0.587, 0.114));
      float mB = dot(texture2D(uMaskTex, uv + vec2( 0.0, 1.0) * ts * sz).rgb, vec3(0.299, 0.587, 0.114));
      float dx = mR - mL;
      float dy = mB - mT;
      float edge = clamp(sqrt(dx * dx + dy * dy) * 5.0, 0.0, 1.0);

      if (uOutline > 0.0) {
        composite.rgb = mix(composite.rgb, vec3(0.0, 0.9, 1.0), edge * uOutline);
      }
      if (uEdgeGlow > 0.0) {
        composite.rgb += vec3(1.0, 0.5, 0.0) * edge * uEdgeGlow * 0.8;
      }
    }

    // 6. Colour grading
    composite.rgb = applyColorAdjustments(composite.rgb, uBrightness, uContrast, uSaturation, uHue);

    gl_FragColor = composite;
  }
`;
