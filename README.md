# 🎯 Rigged Wheel of Fortune

A fully customizable, rigged wheel of fortune web application built with Vue 3 and Anime.js. Perfect for promotions, games, and events where you need to control the outcomes while maintaining the appearance of randomness.

## Demo 
https://rigged-wheel-of-fortune.vercel.app/ (the first spin is bugged, pending fix)
## PIN for the settings where you can control the chance: 6969 (nice)

## ✨ Features

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

### ⚙️ **Admin Controls**
- **Hidden admin panel** (click ⚙️ button)
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

```javascript
{
  sectors: [
    { id: 1, label: 'WIN $100', color: '#ff6b6b', weight: 5 },   // 5% chance
    { id: 2, label: 'WIN $50', color: '#4ecdc4', weight: 10 },   // 10% chance
    { id: 3, label: 'WIN $25', color: '#45b7d1', weight: 15 },   // 15% chance
    { id: 4, label: 'TRY AGAIN', color: '#96ceb4', weight: 25 }, // 25% chance
    { id: 5, label: 'WIN $10', color: '#feca57', weight: 20 },   // 20% chance
    { id: 6, label: 'NO WIN', color: '#ff9ff3', weight: 25 }     // 25% chance
  ]
}
```

## 🎮 Usage

1. **Spin the Wheel**: Click "SPIN THE WHEEL" button
2. **View Result**: Modal displays the outcome with celebrations
3. **Play Again**: Click "Play Again" or close the modal
4. **Admin Panel**: Click ⚙️ to access probability controls

### Admin Panel Features

- **Sector Configuration**: Edit labels, colors, and weights
- **Probability Overview**: Visual chart showing win chances
- **Statistics**: Track spin history and win distribution
- **Presets**: Quick configurations for different scenarios
- **Real-time Updates**: Changes apply immediately

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

- **Admin panel hidden** by default
- **Weight validation** prevents invalid configurations
- **Client-side only** - no server dependencies
- **Transparent algorithm** for auditing purposes

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

The wheel comes with a default configuration perfect for demonstrations. Simply run the project and start spinning!

---

**Built with ❤️ for promotional events and games that need reliable, controllable outcomes.**
