# Session-Based PIN Authentication

## Overview

The Rigged Wheel of Fortune now includes a session-based PIN authentication system that protects the main wheel functionality. Users must enter a PIN code to access the wheel, and sessions automatically expire after 30 minutes of inactivity.

## Features

### 1. **Initial PIN Entry**
- When the website is first opened, a PIN modal appears immediately
- Users cannot spin the wheel until they enter the correct PIN
- The spin button is disabled and displays "ВЪВЕДИ ПИН" when no valid session exists

### 2. **30-Minute Session**
- After successful PIN entry, a 30-minute session is created
- Session data is stored in browser localStorage for persistence across page refreshes
- The session includes:
  - Start time
  - Expiration time (start + 30 minutes)
  - Active status

### 3. **Session Expiration**
- Sessions automatically expire after 30 minutes
- A background monitor checks session validity every 5 seconds
- When a session expires, the PIN modal automatically appears again
- Users attempting to spin with an expired session will be prompted for the PIN

### 4. **Session Persistence**
- Sessions persist across page refreshes within the 30-minute window
- If a user closes and reopens the browser within 30 minutes, they remain authenticated
- After 30 minutes, a new PIN entry is required

### 5. **Configuration Independence**
- **Wheel configuration is separate from session state**
- Any changes to wheel settings (colors, weights, sectors) are saved in localStorage
- Configuration persists even when sessions expire
- Users won't lose their wheel customizations when re-entering the PIN
- Session expiration only requires re-authentication, not reconfiguration

## Technical Implementation

### Components

#### `useSession` Composable (`src/composables/useSession.js`)
A Vue composable that manages session state and lifecycle:

**Key Functions:**
- `createSession()` - Creates a new 30-minute session
- `isSessionValid` - Computed property that returns session validity
- `remainingTime` - Computed property with remaining session time in seconds
- `clearSession()` - Invalidates and removes the current session
- `startSessionMonitor(onExpire)` - Starts monitoring for session expiration
- `stopSessionMonitor()` - Stops the expiration monitor

**Session Storage:**
- Uses localStorage with key `'wheel_session'`
- Stores JSON object with: `startTime`, `expiresAt`, `isActive`

**Configuration Storage (Independent):**
- Uses localStorage with key `'wheel_config'`
- Stores complete wheel configuration including sectors, colors, and weights
- Persists independently from session state

#### App.vue Integration

**New State Variables:**
- `showMainPinModal` - Controls visibility of the main access PIN modal
- `isSessionValid` - Reactive session validity state
- `remainingTime` - Remaining session time

**Key Functions:**
- `onMainPinSuccess()` - Creates session when PIN is entered successfully
- `closeMainPinModal()` - Handles modal close with validation
- `onSessionExpire()` - Callback when session expires
- `spin()` - Modified to check session validity before allowing spins

**Lifecycle:**
- `onMounted` - Initializes session and shows PIN if needed
- `onUnmounted` - Cleans up session monitor

### Security Considerations

⚠️ **Important:** The current PIN code ('6969') is defined client-side in `src/components/PinModal.vue`. This provides basic access control but is NOT secure authentication.

**Recommendations for production:**
1. Change the default PIN before deploying
2. Consider implementing server-side authentication
3. Add rate limiting for PIN attempts
4. Implement secure session tokens
5. Add logging for security auditing

## Usage

### For Users

1. **First Visit:**
   - Open the website
   - A PIN modal appears automatically
   - Enter the PIN code (default: 6969)
   - Click "Въведи" or press Enter

2. **During Active Session:**
   - The wheel is fully accessible
   - Spin as many times as desired within 30 minutes

3. **After Session Expires:**
   - The PIN modal appears again automatically
   - Enter the PIN to continue
   - A new 30-minute session begins

### For Administrators

The admin panel access remains separate and still requires its own PIN entry via the ⚙️ button in the top-right corner.

## Testing

To test the session expiration:

1. **Quick Test:** Modify `SESSION_DURATION` in `src/composables/useSession.js`:
   ```javascript
   const SESSION_DURATION = 1 * 60 * 1000 // 1 minute for testing
   ```

2. **Manual Test:**
   - Enter PIN and note the time
   - Wait 30 minutes
   - Try to spin the wheel
   - PIN modal should appear automatically

3. **Persistence Test:**
   - Enter PIN
   - Refresh the page
   - Wheel should still be accessible (within 30 minutes)
   - After 30 minutes, refresh again
   - PIN modal should appear

## Configuration

### Change Session Duration

Edit `src/composables/useSession.js`:
```javascript
const SESSION_DURATION = 30 * 60 * 1000 // Change value here
```

### Change PIN Code

Edit `src/components/PinModal.vue`:
```javascript
const correctPin = '6969' // Change to your desired PIN
```

### Change Session Check Interval

In `useSession.js`, modify the `startSessionMonitor` function:
```javascript
sessionCheckInterval.value = setInterval(() => {
  // ...
}, 5000) // Change interval here (milliseconds)
```

## Future Enhancements

Potential improvements for future versions:

1. **Multiple PIN Codes:** Support for multiple valid PINs
2. **PIN History:** Track and prevent PIN reuse
3. **Session Extension:** Option to extend session before expiration
4. **Inactivity Detection:** Auto-expire sessions based on user inactivity
5. **Visual Timer:** Display remaining session time to users
6. **Session Logs:** Track session creation and expiration events
7. **Server-Side Auth:** Implement proper backend authentication
8. **Role-Based Access:** Different PINs for different access levels

## Troubleshooting

### Session Not Persisting
- Check browser's localStorage is enabled
- Verify no extensions are blocking localStorage
- Check browser console for errors

### PIN Modal Not Appearing
- Check browser console for JavaScript errors
- Verify `useSession` composable is imported correctly
- Ensure `showMainPinModal` is properly bound in template

### Session Expires Too Quickly
- Verify `SESSION_DURATION` value in `useSession.js`
- Check system clock is set correctly
- Ensure no code is clearing localStorage

## Version History

- **v1.0** - Initial implementation with 30-minute sessions and automatic expiration monitoring

