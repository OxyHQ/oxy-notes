import { OxyProvider, OxyServices } from '@oxyhq/services';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface OxyProviderWrapperProps {
    oxyServices: OxyServices;
    initialScreen: string;
    onClose: () => void;
    onAuthenticated: (user: any) => void;
    theme: 'light' | 'dark';
    isVisible: boolean;
}

const OxyProviderWrapper: React.FC<OxyProviderWrapperProps> = ({
    oxyServices,
    initialScreen,
    onClose,
    onAuthenticated,
    theme,
    isVisible,
}) => {
    if (!isVisible) return null;

    return (
        <View style={styles.modalContainer}>
            <View style={styles.bottomSheetContainer}>
                <OxyProvider
                    oxyServices={oxyServices}
                    initialScreen={initialScreen}
                    onClose={onClose}
                    onAuthenticated={onAuthenticated}
                    theme={theme}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        ...Platform.select({
            ios: {
                zIndex: 999,
            },
            android: {
                elevation: 999,
            },
            default: {
                zIndex: 999,
            }
        }),
    },
    bottomSheetContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        height: '80%', // Adjust this based on your needs
        width: '100%',
        overflow: 'hidden',
    },
});

export default OxyProviderWrapper;
