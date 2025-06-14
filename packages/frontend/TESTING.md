# Notes State Management Testing

This file outlines manual testing scenarios to verify the Zustand migration works correctly.

## Test Scenarios

### 1. Store Initialization
- [ ] Store initializes with correct default state
- [ ] Network status listeners are set up
- [ ] Sync status listeners are set up
- [ ] Initial notes are loaded from storage

### 2. Note Operations (Offline)
- [ ] Create note while offline (should save locally)
- [ ] Update note while offline (should save locally)
- [ ] Delete note while offline (should remove locally)
- [ ] Verify pending sync count increases

### 3. Note Operations (Online)
- [ ] Create note while online (should sync immediately)
- [ ] Update note while online (should sync immediately)
- [ ] Delete note while online (should sync immediately)
- [ ] Verify sync status updates properly

### 4. Sync Operations
- [ ] Manual sync works correctly
- [ ] Auto-sync triggers when coming online
- [ ] Force sync for individual notes works
- [ ] Conflict resolution handles server/local differences

### 5. State Persistence
- [ ] Notes persist across app restarts
- [ ] Pending syncs persist across app restarts
- [ ] Network status updates correctly
- [ ] Sync status reflects actual state

### 6. Component Integration
- [ ] Main notes list displays correctly
- [ ] Create note screen works
- [ ] Edit note screen works
- [ ] All UI updates reflect state changes

### 7. Error Handling
- [ ] Network errors are handled gracefully
- [ ] Sync errors don't crash the app
- [ ] Offline operations continue to work
- [ ] User feedback is appropriate

## Expected Behaviors

1. **Interface Compatibility**: All existing components should work without changes
2. **State Centralization**: All state is managed in the Zustand store
3. **Offline-First**: App works fully offline with sync queue
4. **Expo Compatibility**: Uses only Expo-compatible APIs
5. **Oxy Integration**: Continues to work with Oxy services

## Manual Testing Steps

1. Open app and verify notes load
2. Toggle airplane mode to test offline functionality
3. Create/edit/delete notes in both online and offline modes
4. Verify sync indicators show correct status
5. Check that offline changes sync when back online