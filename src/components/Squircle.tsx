import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  Color,
} from '@shopify/react-native-skia';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { SquircleProps } from '../types/types';
import { getPathParamsForCorner } from '../utils';

const Squircle: React.FC<SquircleProps> = ({
  smoothing = 1,
  style,
  children,
  color,
  ...otherProps
}) => {
  const flattenStyle = useMemo(() => StyleSheet.flatten(style), [style]);
  const {
    borderRadius,
    borderTopLeftRadius = borderRadius,
    borderTopRightRadius = borderRadius,
    borderBottomLeftRadius = borderRadius,
    borderBottomRightRadius = borderRadius,
    borderWidth,
    borderColor,
    borderStyle,
    backgroundColor,
    ...otherStyles
  } = flattenStyle;

  if (
    borderRadius === undefined ||
    (borderTopLeftRadius === undefined &&
      borderTopRightRadius === undefined &&
      borderBottomLeftRadius === undefined &&
      borderBottomRightRadius === undefined)
  ) {
    throw new Error(
      'react-native-squircle-skia: No borderRadius provided in Squircle style'
    );
  }

  if (
    borderWidth !== undefined ||
    borderColor !== undefined ||
    borderStyle !== undefined
  ) {
    throw new Error(
      'react-native-squircle-skia: Setting border is not supported.'
    );
  }
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const canvasRef = useCanvasRef();

  const pathColor = useMemo(() => {
    return (color || backgroundColor || 'transparent') as Color;
  }, [backgroundColor, color]);

  const path = useMemo(() => {
    const squirclePath = Skia.Path.Make();

    const drawTopRightCornerPath = () => {
      if (borderTopRightRadius) {
        const { a, b, c, d, p, circularSectionLength } = getPathParamsForCorner(
          {
            width,
            height,
            cornerRadius: borderTopRightRadius,
            cornerSmoothing: smoothing,
          }
        );
        squirclePath.moveTo(Math.max(width / 2, width - p), 0);
        squirclePath.cubicTo(
          width - (p - a),
          0,
          width - (p - a - b),
          0,
          width - (p - a - b - c),
          d
        );
        squirclePath.rArcTo(
          borderTopRightRadius,
          borderTopRightRadius,
          0,
          true,
          false,
          circularSectionLength,
          circularSectionLength
        );
        squirclePath.cubicTo(
          width,
          p - a - b,
          width,
          p - a,
          width,
          Math.min(height / 2, p)
        );
      } else {
        squirclePath.moveTo(width / 2, 0);
        squirclePath.lineTo(width, 0);
        squirclePath.lineTo(width, height / 2);
      }
    };

    const drawBottomRightCornerPath = () => {
      if (borderBottomRightRadius) {
        const { a, b, c, d, p, circularSectionLength } = getPathParamsForCorner(
          {
            width,
            height,
            cornerRadius: borderBottomRightRadius,
            cornerSmoothing: smoothing,
          }
        );
        squirclePath.lineTo(width, Math.max(height / 2, height - p));
        squirclePath.cubicTo(
          width,
          height - (p - a),
          width,
          height - (p - a - b),
          width - d,
          height - (p - a - b - c)
        );
        squirclePath.rArcTo(
          borderBottomRightRadius,
          borderBottomRightRadius,
          0,
          true,
          false,
          -circularSectionLength,
          circularSectionLength
        );
        squirclePath.cubicTo(
          width - (p - a - b),
          height,
          width - (p - a),
          height,
          Math.max(width / 2, width - p),
          height
        );
      } else {
        squirclePath.lineTo(width, height);
        squirclePath.lineTo(width / 2, height);
      }
    };

    const drawBottomLeftCornerPath = () => {
      if (borderBottomLeftRadius) {
        const { a, b, c, d, p, circularSectionLength } = getPathParamsForCorner(
          {
            width,
            height,
            cornerRadius: borderBottomLeftRadius,
            cornerSmoothing: smoothing,
          }
        );
        squirclePath.lineTo(Math.min(width / 2, p), height);
        squirclePath.cubicTo(
          p - a,
          height,
          p - a - b,
          height,
          p - a - b - c,
          height - d
        );
        squirclePath.rArcTo(
          borderBottomLeftRadius,
          borderBottomLeftRadius,
          0,
          true,
          false,
          -circularSectionLength,
          -circularSectionLength
        );
        squirclePath.cubicTo(
          0,
          height - (p - a - b),
          0,
          height - (p - a),
          0,
          Math.max(height / 2, height - p)
        );
      } else {
        squirclePath.lineTo(0, height);
        squirclePath.lineTo(0, height / 2);
      }
    };

    const drawTopLeftCornerPath = () => {
      if (borderTopLeftRadius) {
        const { a, b, c, d, p, circularSectionLength } = getPathParamsForCorner(
          {
            width,
            height,
            cornerRadius: borderTopLeftRadius,
            cornerSmoothing: smoothing,
          }
        );
        squirclePath.lineTo(0, Math.min(height / 2, p));
        squirclePath.cubicTo(0, p - a, 0, p - a - b, d, p - a - b - c);
        squirclePath.rArcTo(
          borderTopLeftRadius,
          borderTopLeftRadius,
          0,
          true,
          false,
          circularSectionLength,
          -circularSectionLength
        );
        squirclePath.cubicTo(p - a - b, 0, p - a, 0, Math.min(width / 2, p), 0);
      } else {
        squirclePath.lineTo(0, 0);
      }
      squirclePath.close();
    };

    drawTopRightCornerPath();
    drawBottomRightCornerPath();
    drawBottomLeftCornerPath();
    drawTopLeftCornerPath();

    return squirclePath;
  }, [
    smoothing,
    width,
    height,
    borderBottomLeftRadius,
    borderBottomRightRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
  ]);

  const handleLayout: ViewProps['onLayout'] = (event) => {
    setWidth(event.nativeEvent.layout.width);
    setHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={[otherStyles]} {...otherProps} onLayout={handleLayout}>
      <Canvas ref={canvasRef} style={StyleSheet.absoluteFill}>
        <Path path={path} color={pathColor} />
      </Canvas>
      {children}
    </View>
  );
};

export default Squircle;
