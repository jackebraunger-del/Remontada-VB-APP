// Remontada – "angeschnittene Ecke" (cut corner) UI-Baustein.
//
// Im Web-Design (Design-Canvas) wurde das eckige, Valorant-artige Look mit
// CSS `clip-path: polygon(...)` gebaut. React Native kennt `clip-path`
// nicht, deshalb zeichnen wir die exakt gleiche Achteck-Form hier über
// react-native-svg als Hintergrund und legen den Inhalt normal darüber.
//
// `corners="tl-br"`   -> oben-links & unten-rechts angeschnitten (Karten, Buttons, Kacheln)
// `corners="top-both"` -> beide oberen Ecken angeschnitten (Bottom-Sheet in der Map)

import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

type Corners = 'tl-br' | 'top-both';

function buildPoints(w: number, h: number, cut: number, corners: Corners): string {
  const c = Math.min(cut, w / 2, h / 2);
  const pts =
    corners === 'top-both'
      ? [
          [c, 0],
          [w - c, 0],
          [w, c],
          [w, h],
          [0, h],
          [0, c],
        ]
      : [
          [c, 0],
          [w, 0],
          [w, h - c],
          [w - c, h],
          [0, h],
          [0, c],
        ];
  return pts.map((p) => p.join(',')).join(' ');
}

export function CutCornerView({
  children,
  style,
  cut = 14,
  corners = 'tl-br',
  backgroundColor = 'transparent',
  borderColor,
  borderWidth = 0,
  contentStyle,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  cut?: number;
  corners?: Corners;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  }, []);

  return (
    <View onLayout={onLayout} style={[{ overflow: 'hidden' }, style]}>
      {size.w > 0 && size.h > 0 ? (
        <Svg
          width={size.w}
          height={size.h}
          style={{ position: 'absolute', top: 0, left: 0 }}
          pointerEvents="none">
          <Polygon
            points={buildPoints(size.w, size.h, cut, corners)}
            fill={backgroundColor}
            stroke={borderColor ?? 'transparent'}
            strokeWidth={borderWidth}
          />
        </Svg>
      ) : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
