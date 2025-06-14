import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

export const useHover = () => {
  // Only use hover on web platform
  const isWeb = Platform.OS === 'web';
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = useCallback(() => {
    if (isWeb) {
      setIsHovered(true);
    }
  }, [isWeb]);
  
  const handleMouseLeave = useCallback(() => {
    if (isWeb) {
      setIsHovered(false);
    }
  }, [isWeb]);
  
  return {
    isHovered,
    hoverProps: isWeb
      ? {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        }
      : {}
  };
};
