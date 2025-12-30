import React from 'react';
import { View, ViewProps, TouchableOpacity } from 'react-native';
import clsx from 'clsx';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  className,
  onPress,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl p-4';

  const variants = {
    elevated: 'shadow-sm', // NativeWind/Tailwind shadow might require manual elevation on Android
    outlined: 'border border-gray-200',
    flat: 'bg-gray-50',
  };

  const Content = (
    <View className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
};
