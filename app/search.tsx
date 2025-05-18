import { Ionicons } from '@expo/vector-icons';
import { useOxy } from '@oxyhq/services';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define a User type for the search results based on actual API response
interface UserSearchResult {
    id: string;               // Mapped from _id in the API
    username: string;
    profilePicture?: string;  // We'll generate this if not provided
    email?: string;
    createdAt?: string;
    fullName?: string;        // Combined from name.first and name.last
    description?: string;
    followersCount?: number;  // From _count.followers
    followingCount?: number;  // From _count.following
}

export default function SearchScreen() {
    const { user, isAuthenticated, oxyServices } = useOxy();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 10; // Number of results to fetch per page

    // If user is not authenticated, redirect to home page
    if (!isAuthenticated) {
        return (
            <View style={styles.notAuthenticatedContainer}>
                <Text style={styles.notAuthenticatedText}>Please sign in to search for users</Text>
                <TouchableOpacity
                    style={styles.signInButton}
                    onPress={() => router.push('/')}
                >
                    <Text style={styles.signInButtonText}>Go to Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleSearch = async (resetSearch = true) => {
        if (!searchQuery.trim()) {
            setError('Please enter a username to search for');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Reset pagination if this is a new search
            const currentOffset = resetSearch ? 0 : offset;
            if (resetSearch) {
                setOffset(0);
                setHasMore(true);
            }

            // Call the API to search for users
            const results = await oxyServices.searchProfiles(searchQuery, LIMIT, currentOffset);

            console.log('API search results:', JSON.stringify(results, null, 2));

            // Check if we have more results to load
            setHasMore(results.length === LIMIT);

            // Update offset for next page
            if (!resetSearch) {
                setOffset(currentOffset + results.length);
            }

            // Transform API results to match our expected structure
            const transformedResults = results.map(user => {
                // Use type assertion and safely access properties
                const userData = user as any;

                // Build a full name from first and last name if available
                let fullName = '';
                if (userData.name) {
                    const firstName = userData.name.first || '';
                    const lastName = userData.name.last || '';
                    fullName = [firstName, lastName].filter(Boolean).join(' ');
                }

                return {
                    id: userData._id || `user-${Math.random().toString(36).substr(2, 9)}`, // Map _id to id
                    username: userData.username || 'Unknown User',
                    profilePicture: userData.profilePicture || userData.coverPhoto || undefined, // Use coverPhoto as fallback
                    email: userData.email,
                    createdAt: userData.createdAt,
                    fullName: fullName,
                    description: userData.description,
                    followersCount: userData._count?.followers,
                    followingCount: userData._count?.following
                };
            });

            // Set the transformed results
            setSearchResults(resetSearch ?
                transformedResults :
                [...searchResults, ...transformedResults]
            );

        } catch (err: any) {
            console.error('Search error:', err);
            // Extract a user-friendly error message
            const errorMessage = err.message || 'An error occurred while searching for users';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreResults = () => {
        if (!isLoading && hasMore) {
            handleSearch(false); // Load more without resetting
        }
    };

    const handleViewProfile = async (userId: string) => {
        try {
            console.log('Attempting to view profile, userID:', userId);

            // Make sure userId is valid
            if (!userId || userId.startsWith('user-')) {
                // This is a generated ID, which won't work with the API
                throw new Error('Valid user ID is required to view profile');
            }

            // First find the user in our results to get the username
            const userToView = searchResults.find(u => u.id === userId);
            console.log('Found user to view:', userToView);

            if (!userToView) {
                throw new Error('User not found in search results');
            }

            if (!userToView.username) {
                throw new Error('Username is missing');
            }

            // Navigate to profile screen with username as parameter
            router.push({
                pathname: '/profile',
                params: { username: userToView.username }
            });

        } catch (err: any) {
            console.error('Error handling profile view:', err);
            setError(`Could not load user profile: ${err.message || 'Unknown error'}`);
        }
    };

    const handleFollowUser = async (userId: string) => {
        try {
            console.log('Attempting to follow user with ID:', userId);

            // Call the follow API
            const result = await oxyServices.followUser(userId);
            console.log('Follow result:', result);

            // Show success message
            alert(`Successfully followed user. ${result.message || ''}`);

            // In a real app, you might refresh the user data here to show updated follow status
        } catch (err: any) {
            console.error('Error following user:', err);

            // Show a more specific error if available
            const errorMessage = err.message || 'Failed to follow user';
            setError(errorMessage);

            // Show an alert for immediate feedback
            alert(`Error: ${errorMessage}`);
        }
    };

    const renderUserItem = ({ item }: { item: UserSearchResult }) => {
        // Check if the user has a valid ID
        const hasValidId = !!item.id && !item.id.startsWith('user-');

        // Format dates for display
        const joinedDate = item.createdAt ?
            new Date(item.createdAt).toLocaleDateString() :
            'Unknown date';

        // Determine if we have a name to display
        const displayName = item.fullName?.trim() || item.username;

        return (
            <TouchableOpacity
                style={[
                    styles.userItem,
                    !hasValidId && styles.disabledUserItem
                ]}
                onPress={() => hasValidId ? handleViewProfile(item.id) : alert('Full profile not available for this user')}
                activeOpacity={hasValidId ? 0.7 : 0.9}
            >
                <View style={styles.userImageContainer}>
                    {item.profilePicture ? (
                        <Image source={{ uri: item.profilePicture }} style={styles.userImage} />
                    ) : (
                        <View style={styles.userImagePlaceholder}>
                            <Text style={styles.userImagePlaceholderText}>
                                {item.username.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.username}>{displayName}</Text>
                    <Text style={styles.userHandle}>@{item.username}</Text>

                    {item.description ? (
                        <Text style={styles.userBio} numberOfLines={2} ellipsizeMode="tail">
                            {item.description}
                        </Text>
                    ) : null}

                    <View style={styles.userStats}>
                        {typeof item.followersCount === 'number' && (
                            <Text style={styles.userStat}>{item.followersCount} followers</Text>
                        )}
                        {typeof item.followingCount === 'number' && (
                            <Text style={styles.userStat}>{item.followingCount} following</Text>
                        )}
                        <Text style={styles.userStat}>Joined {joinedDate}</Text>
                    </View>
                </View>
                {hasValidId ? (
                    <TouchableOpacity
                        style={styles.userActionButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleFollowUser(item.id);
                        }}
                    >
                        <Ionicons name="person-add-outline" size={24} color="#d169e5" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.userActionButton}>
                        <Ionicons name="information-circle-outline" size={24} color="#888" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Find Users</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by username"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => handleSearch()}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => setSearchQuery('')}
                        >
                            <Ionicons name="close-circle" size={20} color="#888" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => handleSearch()}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.searchButtonText}>Search</Text>
                    )}
                </TouchableOpacity>
            </View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.resultsList}
                onEndReached={loadMoreResults}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isLoading && searchResults.length > 0 ? (
                        <View style={styles.loadingMore}>
                            <ActivityIndicator color="#d169e5" />
                            <Text style={styles.loadingMoreText}>Loading more...</Text>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !isLoading && !error && searchQuery ? (
                        <View style={styles.emptyResultsContainer}>
                            <Ionicons name="search-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyResultsText}>No users found</Text>
                            <Text style={styles.emptyResultsSubtext}>Try a different search term</Text>
                        </View>
                    ) : searchQuery.length === 0 ? (
                        <View style={styles.initialSearchContainer}>
                            <Ionicons name="people-outline" size={60} color="#ccc" />
                            <Text style={styles.initialSearchText}>Search for users by username</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 12,
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
    searchContainer: {
        padding: 16,
        flexDirection: 'row',
    },
    searchInputContainer: {
        flex: 1,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    clearButton: {
        padding: 4,
    },
    searchButton: {
        backgroundColor: '#d169e5',
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    errorText: {
        marginHorizontal: 16,
        color: '#ff6b6b',
        marginBottom: 16,
    },
    resultsList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    disabledUserItem: {
        opacity: 0.7,
        backgroundColor: '#f0f0f0',
    },
    userImageContainer: {
        marginRight: 12,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    userImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#d169e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userImagePlaceholderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userId: {
        fontSize: 14,
        color: '#888',
    },
    userEmail: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
    userHandle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    userBio: {
        fontSize: 14,
        color: '#555',
        marginVertical: 4,
        lineHeight: 18,
    },
    userStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    userStat: {
        fontSize: 12,
        color: '#888',
        marginRight: 10,
    },
    userActionButton: {
        padding: 8,
    },
    emptyResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyResultsText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        color: '#555',
    },
    emptyResultsSubtext: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
    },
    initialSearchContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    initialSearchText: {
        fontSize: 16,
        color: '#888',
        marginTop: 12,
        textAlign: 'center',
    },
    loadingMore: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    loadingMoreText: {
        marginLeft: 8,
        color: '#888',
        fontSize: 14,
    },
});
