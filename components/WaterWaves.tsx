import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface WaterWavesProps {
  progress: number; // 0 to 100
  height: number;
  width: number;
}

export function WaterWaves({ progress, height, width }: WaterWavesProps) {
  const waveAnimation = useSharedValue(0);
  const fillHeight = (progress / 100) * height;

  useEffect(() => {
    waveAnimation.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const waveStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: waveAnimation.value * 10,
        },
      ],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(fillHeight, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    };
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Animated.View style={[styles.fill, fillStyle]}>
        <Animated.View style={[styles.wave, waveStyle]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7BB3F0',
    borderRadius: 20,
  },
  wave: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    opacity: 0.7,
  },
});