import { Ionicons } from '@expo/vector-icons';
import { useOxy } from '@oxyhq/services/full';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface for user profile data
interface ProfileData {
    id: string;
    username: string;
    profilePicture?: string;
    email?: string;
    createdAt?: string;
    fullName?: string;
    description?: string;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
}

export default function ProfileScreen() {
    const { user: currentUser, isAuthenticated, logout, oxyServices } = useOxy();
    const params = useLocalSearchParams();
    const username = params.username as string;

    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCurrentUser, setIsCurrentUser] = useState(true);

    // Fetch profile data if viewing another user
    useEffect(() => {
        if (username && username !== currentUser?.username) {
            setIsCurrentUser(false);
            fetchProfileData(username);
        } else {
            // Use current user data
            setIsCurrentUser(true);
            if (currentUser) {
                setProfileData({
                    id: currentUser.id,
                    username: currentUser.username,
                    email: currentUser.email,
                    profilePicture: currentUser.profilePicture,
                    createdAt: currentUser.createdAt,
                    // Add other fields as needed
                });
            }
        }
    }, [username, currentUser]);

    const fetchProfileData = async (username: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await oxyServices.getProfileByUsername(username);
            console.log('Fetched profile data:', data);

            // Transform API data to our ProfileData format
            const userData = data as any;

            // Format name if available
            let fullName = '';
            if (userData.name) {
                const firstName = userData.name.first || '';
                const lastName = userData.name.last || '';
                fullName = [firstName, lastName].filter(Boolean).join(' ');
            }

            setProfileData({
                id: userData._id || userData.id,
                username: userData.username,
                profilePicture: userData.profilePicture || userData.coverPhoto,
                email: userData.email,
                createdAt: userData.createdAt,
                fullName: fullName,
                description: userData.description,
                followersCount: userData._count?.followers,
                followingCount: userData._count?.following
            });
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setError(err.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    // If user is not authenticated, redirect to home page
    if (!isAuthenticated) {
        return (
            <View style={styles.notAuthenticatedContainer}>
                <Text style={styles.notAuthenticatedText}>Please sign in to view profiles</Text>
                <TouchableOpacity
                    style={styles.signInButton}
                    onPress={() => router.push('/')}
                >
                    <Text style={styles.signInButtonText}>Go to Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Handle follow/unfollow action
    const handleFollowUser = async () => {
        if (!profileData || isCurrentUser) return;

        try {
            const result = await oxyServices.followUser(profileData.id);
            console.log('Follow result:', result);
            alert(`Success! ${result.message || ''}`);

            // Refresh profile data
            fetchProfileData(profileData.username);
        } catch (err: any) {
            console.error('Error following user:', err);
            setError(err.message || 'Failed to follow user');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#d169e5" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={60} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />

            {/* Header with back button */}
            <View style={styles.navigationHeader}>
                <TouchableOpacity
                    style={styles.backButtonSmall}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isCurrentUser ? 'My Profile' : 'User Profile'}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.profileImageContainer}>
                        {profileData?.profilePicture ? (
                            <Image
                                source={{ uri: profileData.profilePicture }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Text style={styles.profileImagePlaceholderText}>
                                    {profileData?.username?.substring(0, 2).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.username}>
                        {profileData?.fullName || profileData?.username || 'User'}
                    </Text>
                    <Text style={styles.userHandle}>@{profileData?.username}</Text>

                    {profileData?.description && (
                        <Text style={styles.userBio}>{profileData.description}</Text>
                    )}

                    <View style={styles.statsRow}>
                        {typeof profileData?.followersCount === 'number' && (
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{profileData.followersCount}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </View>
                        )}

                        {typeof profileData?.followingCount === 'number' && (
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{profileData.followingCount}</Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.infoSection}>
                    {profileData?.id && (
                        <View style={styles.infoItem}>
                            <Ionicons name="person-outline" size={24} color="#555" />
                            <Text style={styles.infoLabel}>User ID:</Text>
                            <Text style={styles.infoValue}>{profileData.id}</Text>
                        </View>
                    )}

                    {isCurrentUser && profileData?.email && (
                        <View style={styles.infoItem}>
                            <Ionicons name="mail-outline" size={24} color="#555" />
                            <Text style={styles.infoLabel}>Email:</Text>
                            <Text style={styles.infoValue}>{profileData.email}</Text>
                        </View>
                    )}

                    {profileData?.createdAt && (
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={24} color="#555" />
                            <Text style={styles.infoLabel}>Joined:</Text>
                            <Text style={styles.infoValue}>
                                {new Date(profileData.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.actionsSection}>
                    {!isCurrentUser ? (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleFollowUser}
                        >
                            <Ionicons name="person-add-outline" size={24} color="#fff" />
                            <Text style={styles.actionButtonText}>Follow User</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push('/search')}
                        >
                            <Ionicons name="search-outline" size={24} color="#fff" />
                            <Text style={styles.actionButtonText}>Find Users</Text>
                        </TouchableOpacity>
                    )}

                    {isCurrentUser && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.logoutButton]}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#fff" />
                            <Text style={styles.actionButtonText}>Logout</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    notAuthenticatedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    notAuthenticatedText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#555',
    },
    signInButton: {
        backgroundColor: '#0066CC',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Navigation header
    navigationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButtonSmall: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 12,
        color: '#888',
    },
    // Error state
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        marginTop: 12,
        color: '#ff6b6b',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#0066CC',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 16,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImageContainer: {
        marginBottom: 16,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#d169e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImagePlaceholderText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userHandle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 12,
    },
    userBio: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginVertical: 12,
        paddingHorizontal: 20,
    },
    email: {
        fontSize: 16,
        color: '#555',
    },
    // Stats row
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    statItem: {
        alignItems: 'center',
        marginHorizontal: 20,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    infoSection: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    infoLabel: {
        fontSize: 16,
        color: '#555',
        marginLeft: 12,
        width: 80,
    },
    infoValue: {
        fontSize: 16,
        flex: 1,
        textAlign: 'right',
    },
    actionsSection: {
        marginBottom: 30,
    },
    actionButton: {
        backgroundColor: '#d169e5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    logoutButton: {
        backgroundColor: '#ff6b6b',
    },
});
