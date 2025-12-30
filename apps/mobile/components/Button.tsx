import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import clsx from 'clsx';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  block?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  disabled,
  className,
  ...props
}) => {
  const baseStyles = 'items-center justify-center rounded-xl flex-row';

  const variants = {
    primary: 'bg-primary-500 active:bg-primary-600',
    secondary: 'bg-gray-100 active:bg-gray-200',
    outline: 'bg-transparent border border-gray-300 active:bg-gray-50',
    ghost: 'bg-transparent active:bg-gray-100',
    danger: 'bg-red-500 active:bg-red-600',
  };

  const textVariants = {
    primary: 'text-white font-semibold',
    secondary: 'text-gray-800 font-medium',
    outline: 'text-gray-700 font-medium',
    ghost: 'text-gray-600 font-medium',
    danger: 'text-white font-semibold',
  };

  const sizes = {
    sm: 'px-3 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50',
        block ? 'w-full' : 'self-start',
        className
      )}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? 'white' : '#6b7280'}
          className="mr-2"
          size="small"
        />
      )}
      <Text className={clsx(textVariants[variant], textSizes[size])}>{title}</Text>
    </TouchableOpacity>
  );
};
