import React from 'react';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface BlurtLogoProps {
  size?: number;
}

export const BlurtLogo: React.FC<BlurtLogoProps> = ({ size = 72 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="blurtGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#60A5FA" stopOpacity="1" />
        <Stop offset="1" stopColor="#1D4ED8" stopOpacity="1" />
      </LinearGradient>
    </Defs>

    {/* Background — rounded square matching app-icon shape */}
    <Rect x="0" y="0" width="100" height="100" rx="22" fill="url(#blurtGrad)" />

    {/* Subtle top-light sheen */}
    <Rect x="0" y="0" width="100" height="52" rx="22" fill="rgba(255,255,255,0.09)" />

    {/* Audio waveform — 5 bars, tallest in centre, fades outward */}
    {/* Bar 1 */}
    <Rect x="20" y="42" width="8" height="16" rx="4" fill="white" fillOpacity="0.45" />
    {/* Bar 2 */}
    <Rect x="33" y="35" width="8" height="30" rx="4" fill="white" fillOpacity="0.70" />
    {/* Bar 3 — tallest, full opacity */}
    <Rect x="46" y="28" width="8" height="44" rx="4" fill="white" fillOpacity="1" />
    {/* Bar 4 */}
    <Rect x="59" y="35" width="8" height="30" rx="4" fill="white" fillOpacity="0.70" />
    {/* Bar 5 */}
    <Rect x="72" y="42" width="8" height="16" rx="4" fill="white" fillOpacity="0.45" />
  </Svg>
);
