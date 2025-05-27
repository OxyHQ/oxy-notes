import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useOxy } from '@oxyhq/services/full';

// Test component for multi-user functionality
export default function MultiUserTestScreen() {
    const {
        user,
        users,
        isAuthenticated,
        isLoading,
        logout,
        switchUser,
        removeUser,
        getUserSessions,
        logoutSession,
        logoutAll,
        showBottomSheet,
    } = useOxy();

    const [sessions, setSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    const handleAddAccount = () => {
        // Show the sign-in bottom sheet to add another account
        showBottomSheet?.('SignIn');
    };

    const handleSwitchUser = async (targetUser: any) => {
        try {
            await switchUser(targetUser.id);
            Alert.alert('Success', `Switched to ${targetUser.username}`);
        } catch (error) {
            Alert.alert('Switch Failed', error instanceof Error ? error.message : 'Unknown error');
        }
    };

    const handleRemoveUser = async (targetUser: any) => {
        Alert.alert(
            'Remove Account',
            `Are you sure you want to remove ${targetUser.username} from this device?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeUser(targetUser.id);
                            Alert.alert('Success', 'Account removed successfully');
                        } catch (error) {
                            Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
                        }
                    },
                },
            ]
        );
    };

    const loadSessions = async () => {
        if (!user) return;

        setLoadingSessions(true);
        try {
            const userSessions = await getUserSessions();
            setSessions(userSessions);
        } catch {
            Alert.alert('Error', 'Failed to load sessions');
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleLogoutSession = async (sessionId: string) => {
        try {
            await logoutSession(sessionId);
            Alert.alert('Success', 'Session logged out successfully');
            loadSessions(); // Refresh sessions
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
        }
    };

    const handleLogoutAll = async () => {
        Alert.alert(
            'Logout All Sessions',
            'This will log you out of all devices. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logoutAll();
                            Alert.alert('Success', 'Logged out of all sessions');
                        } catch (error) {
                            Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
                        }
                    },
                },
            ]
        );
    };

    const handleLogoutCurrentUser = async () => {
        try {
            await logout();
            Alert.alert('Success', 'Logged out successfully');
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Multi-User Test Screen</Text>

                {/* Authentication Controls */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Authentication</Text>
                    {!isAuthenticated ? (
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={handleAddAccount}
                        >
                            <Text style={styles.buttonText}>Sign In</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={handleAddAccount}
                        >
                            <Text style={styles.secondaryButtonText}>Add Another Account</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Current User Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current User</Text>
                    {isAuthenticated && user ? (
                        <View style={styles.userCard}>
                            <Text style={styles.username}>{user.username}</Text>
                            {user.email && <Text style={styles.email}>{user.email}</Text>}
                            <Text style={styles.userId}>ID: {user.id}</Text>
                        </View>
                    ) : (
                        <Text style={styles.notLoggedIn}>Not logged in</Text>
                    )}
                </View>

                {/* All Users */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>All Accounts ({users?.length || 0})</Text>
                    {users && users.length > 0 ? (
                        users.map((authUser, index) => (
                            <View key={authUser.id} style={styles.userCard}>
                                <View style={styles.userInfo}>
                                    <Text style={styles.username}>
                                        {authUser.username}
                                        {user?.id === authUser.id && (
                                            <Text style={styles.currentLabel}> (Current)</Text>
                                        )}
                                    </Text>
                                    {authUser.email && <Text style={styles.email}>{authUser.email}</Text>}
                                    <Text style={styles.userId}>ID: {authUser.id}</Text>
                                </View>
                                <View style={styles.userActions}>
                                    {user?.id !== authUser.id && (
                                        <TouchableOpacity
                                            style={[styles.button, styles.secondaryButton]}
                                            onPress={() => handleSwitchUser(authUser)}
                                        >
                                            <Text style={styles.secondaryButtonText}>Switch</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={[styles.button, styles.dangerButton]}
                                        onPress={() => handleRemoveUser(authUser)}
                                    >
                                        <Text style={styles.buttonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noUsers}>No accounts signed in</Text>
                    )}
                </View>

                {/* Session Management */}
                {isAuthenticated && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Active Sessions</Text>
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={loadSessions}
                                disabled={loadingSessions}
                            >
                                {loadingSessions ? (
                                    <ActivityIndicator size="small" color="#007AFF" />
                                ) : (
                                    <Text style={styles.secondaryButtonText}>Refresh</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {sessions.length > 0 ? (
                            sessions.map((session, index) => (
                                <View key={session.id} style={styles.sessionCard}>
                                    <View style={styles.sessionInfo}>
                                        <Text style={styles.deviceName}>
                                            {session.deviceName || 'Unknown Device'}
                                            {session.isCurrent && (
                                                <Text style={styles.currentLabel}> (Current)</Text>
                                            )}
                                        </Text>
                                        <Text style={styles.sessionDetail}>
                                            {session.deviceType} • {session.platform}
                                        </Text>
                                        <Text style={styles.sessionDetail}>
                                            Last active: {new Date(session.lastActivity).toLocaleString()}
                                        </Text>
                                        {session.ipAddress && (
                                            <Text style={styles.sessionDetail}>IP: {session.ipAddress}</Text>
                                        )}
                                    </View>
                                    {!session.isCurrent && (
                                        <TouchableOpacity
                                            style={[styles.button, styles.dangerButton]}
                                            onPress={() => handleLogoutSession(session.id)}
                                        >
                                            <Text style={styles.buttonText}>Logout</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noSessions}>No active sessions</Text>
                        )}

                        <TouchableOpacity
                            style={[styles.button, styles.dangerButton]}
                            onPress={handleLogoutAll}
                        >
                            <Text style={styles.buttonText}>Logout All Sessions</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Main Logout */}
                {isAuthenticated && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={[styles.button, styles.dangerButton]}
                            onPress={handleLogoutCurrentUser}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Logout Current User</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    userCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userActions: {
        flexDirection: 'row',
        gap: 8,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    userId: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    currentLabel: {
        color: '#007AFF',
        fontWeight: 'normal',
    },
    sessionCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sessionInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    sessionDetail: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    notLoggedIn: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
    noUsers: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    noSessions: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 16,
    },
});