import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import clsx from 'clsx';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  containerClassName,
  ...props
}) => {
  return (
    <View className={clsx('w-full', containerClassName)}>
      {label && <Text className="text-gray-700 mb-2 font-medium">{label}</Text>}
      <TextInput
        className={clsx(
          'bg-gray-100 px-4 py-3 rounded-xl text-base text-gray-800',
          error && 'border border-red-500 bg-red-50',
          className
        )}
        placeholderTextColor="#9ca3af" // gray-400
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};
