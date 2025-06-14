import React from 'react';
import MasonryList from '@react-native-seoul/masonry-list';

interface MasonryGridProps {
  data: any[];
  keyExtractor: (item: any) => string;
  numColumns?: number;
  showsVerticalScrollIndicator?: boolean;
  renderItem: ({ item }: { item: any }) => React.ReactElement;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReachedThreshold?: number;
  onEndReached?: () => void;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  data,
  keyExtractor,
  numColumns = 2,
  showsVerticalScrollIndicator = false,
  renderItem,
  refreshing = false,
  onRefresh,
  onEndReachedThreshold = 0.1,
  onEndReached,
}) => {
  const MasonryComponent = MasonryList as any; // Type assertion to bypass type issues

  return (
    <MasonryComponent
      data={data}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      renderItem={renderItem}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReachedThreshold={onEndReachedThreshold}
      onEndReached={onEndReached}
      columnWrapperStyle={{ gap: 16 }}
      contentContainerStyle={{ padding: 4 }}
    />
  );
};

export default MasonryGrid;
