# 🎯 Rigged Wheel of Fortune

A fully customizable, rigged wheel of fortune web application built with Vue 3 and Anime.js. Perfect for promotions, games, and events where you need to control the outcomes while maintaining the appearance of randomness.

## ✨ Features

### 🔐 **Session-Based Authentication**
- **PIN-protected access** to the wheel
- **30-minute sessions** with automatic expiration
- **Session persistence** across page refreshes
- **Visual session timer** showing remaining time
- **Auto-prompt** when session expires

### 🎛️ **Rigged System**
- **Pre-determined outcomes** based on weighted probabilities
- **Authentic physics** - the arrow lands exactly where the wheel stops
- **Configurable weights** for each sector
- **Multiple preset configurations** (Fair, Low Win Rate, High Win Rate)

### 🎨 **Modern UI**
- **Smooth 60fps animations** using Anime.js
- **Responsive design** that works on all devices
- **Beautiful gradients** and modern styling
- **Celebration effects** with confetti animations
- **Single-use spin button** with result display
- **Live session countdown** in the corner

### ⚙️ **Admin Controls**
- **Hidden admin panel** (click ⚙️ button)
- **Separate PIN protection** for admin access
- **Real-time probability adjustment**
- **Sector customization** (labels, colors, weights)
- **Live probability visualization**
- **Spin statistics tracking**
- **Add/remove sectors** dynamically

### 📱 **Responsive Design**
- **Mobile-first** approach
- **Touch-friendly** interface
- **Optimized** for all screen sizes
- **Professional** visual design

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open http://localhost:3000 to view the wheel.

## 🎯 How It Works

### The Rigging Algorithm

1. **Weight-based Selection**: Each sector has a configurable weight
2. **Pre-determined Winner**: Winner is selected before the spin using weighted random
3. **Reverse Physics**: Target angle is calculated based on the predetermined winner
4. **Realistic Animation**: Wheel spins with authentic momentum and deceleration
5. **Authentic Landing**: Arrow lands exactly where the physics dictate

### Example Configuration

The wheel now uses **roulette-style colors** by default:

```javascript
{
  sectors: [
    { id: 1, label: 'WIN $100', color: '#00C851', weight: 5 },   // 5% - GREEN (highest prize)
    { id: 2, label: 'WIN $50', color: '#e74c3c', weight: 10 },   // 10% - RED
    { id: 3, label: 'WIN $25', color: '#1a1a1a', weight: 15 },   // 15% - BLACK
    { id: 4, label: 'TRY AGAIN', color: '#e74c3c', weight: 25 }, // 25% - RED
    { id: 5, label: 'WIN $10', color: '#1a1a1a', weight: 20 },   // 20% - BLACK
    { id: 6, label: 'NO WIN', color: '#e74c3c', weight: 15 },    // 15% - RED
    { id: 7, label: 'WIN $5', color: '#1a1a1a', weight: 10 }     // 10% - BLACK
  ]
}
```

When adding new sectors via the admin panel, colors automatically alternate between red and black.

## 🎮 Usage

### First Time Access

1. **Enter PIN**: A PIN modal appears on first visit (default PIN: 6969)
2. **Session Created**: After successful PIN entry, a 30-minute session begins
3. **Session Timer**: Watch the countdown in the top-left corner
4. **Spin Away**: Use the wheel freely for 30 minutes

### Using the Wheel

1. **Spin the Wheel**: Click "SPIN THE WHEEL" button
2. **View Result**: Modal displays the outcome with celebrations
3. **Play Again**: Click "Play Again" or close the modal
4. **Admin Panel**: Click ⚙️ to access probability controls

### Session Management

- **Active Session**: Timer shows remaining time (e.g., "29:45")
- **Session Expires**: PIN modal appears automatically after 30 minutes
- **Page Refresh**: Session persists if within 30 minutes
- **Manual Lock**: Close browser to end session immediately

### Admin Panel Features

- **Sector Configuration**: Edit labels, colors, and weights
- **Probability Overview**: Visual chart showing win chances
- **Statistics**: Track spin history and win distribution
- **Presets**: Quick configurations for different scenarios
- **Real-time Updates**: Changes apply immediately
- **Auto-Persistence**: Configuration automatically saved across sessions
- **Import/Export**: Share configurations between devices

## 🛠️ Technology Stack

- **Vue 3** - Reactive frontend framework
- **Anime.js** - Smooth animation library
- **Vite** - Fast development server
- **CSS3** - Modern styling with gradients
- **SVG** - Scalable wheel graphics

## 📊 Customization

### Adding New Sectors

```javascript
// In the admin panel or programmatically
const newSector = {
  id: uniqueId,
  label: 'Your Prize',
  color: '#yourcolor',
  weight: 15 // Probability weight
}
```

### Changing Animation Settings

```javascript
// In WheelComponent.vue
const animation = anime({
  targets: wheelGroup.value,
  rotate: finalRotation,
  duration: 3000, // Spin duration
  easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)', // Deceleration curve
})
```

## 🎯 Use Cases

- **Marketing Promotions** - Control prize distribution
- **Trade Shows** - Guaranteed prizes for key prospects
- **Retail Events** - Manage inventory and costs
- **Gaming Applications** - Balanced reward systems
- **Educational Tools** - Probability demonstrations

## 🔒 Security Features

### Access Control
- **PIN-protected main access** with session management
- **Separate admin PIN** for configuration changes
- **30-minute auto-expiration** for enhanced security
- **Session persistence** in browser localStorage

### System Security
- **Admin panel hidden** by default
- **Weight validation** prevents invalid configurations
- **Client-side only** - no server dependencies
- **Transparent algorithm** for auditing purposes

### Configuration
- Change PIN in `src/components/PinModal.vue` (line 64)
- Adjust session duration in `src/composables/useSession.js`
- Session stored locally, cleared on expiration

⚠️ **Important**: The PIN system is client-side only. For production use with sensitive data, implement server-side authentication.

## 📈 Statistics Tracking

The system tracks:
- Total number of spins
- Win distribution by sector
- Actual vs expected probabilities
- Recent spin history

## 🎨 Themes & Styling

Easy to customize with CSS variables:
- Gradient backgrounds
- Sector colors
- Button styles
- Animation timings

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🎉 Demo

The wheel comes with a default configuration perfect for demonstrations. Simply run the project, enter the PIN (6969), and start spinning!

## 📚 Additional Documentation

- **[SESSION-AUTH.md](./SESSION-AUTH.md)** - Detailed session authentication documentation
- **[AGENTS.md](./AGENTS.md)** - AI agent instructions for the project

## 🔧 Configuration Management

### Configuration Persistence

The wheel configuration is automatically saved to browser localStorage:

- **Automatic Saving**: Any changes made through the admin panel are instantly saved
- **Session Independent**: Configuration persists even when the session expires
- **Priority Order**: 
  1. localStorage (user's customized settings)
  2. `/config.json` (default configuration)
  3. Hardcoded defaults (fallback)

### Sharing Configurations

To transfer configuration between devices:
1. Open admin panel (⚙️ button)
2. Click "Export Configuration" to download JSON file
3. On target device, click "Import Configuration" to upload

### Configuration Files

- **`public/config.json`** - Default wheel configuration (initial load only)
- **`localStorage.wheel_config`** - Active configuration with user changes
- **`src/composables/useSession.js`** - Session management logic
- **`src/components/PinModal.vue`** - PIN entry interface

---

**Built with ❤️ for promotional events and games that need reliable, controllable outcomes.**