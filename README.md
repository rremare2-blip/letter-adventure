# 🌈 Letter Adventure

An interactive, beautifully designed web app for teaching children letters and writing their names. Features 5 different game types, progress tracking, and a delightful 10-day learning journey.

## Features

✨ **Interactive Learning Games:**
- 🃏 **Flashcards** - Learn letters with reveal cards
- 🔍 **Letter Hunt** - Find letters in your name
- ✏️ **Letter Tracing** - Draw and trace letters (touch-friendly)
- ✍️ **Writing Practice** - Write your name
- 🎲 **Memory Game** - Arrange scrambled letters

📅 **10-Day Adventure System**
- Progressive learning path
- Locked/unlocked days based on progress
- Star-based reward system

💾 **Data Persistence**
- All progress saved to browser localStorage
- Works offline after first load

📱 **Mobile-First Design**
- Touch-optimized interface
- Responsive design for all devices
- PWA-ready (add to home screen)

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will open automatically at http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

The `dist/` folder will contain your production-ready website.

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Deploy to GitHub Pages

```bash
npm run build
# Push the `dist` folder to your gh-pages branch
```

### Deploy to Netlify

```bash
npm run build
# Drag and drop the `dist` folder to Netlify
# or connect your Git repository
```

### Deploy to Any Static Host

The `dist` folder is a complete, standalone website. Upload it to:
- AWS S3 + CloudFront
- Azure Static Web Apps
- Google Cloud Storage
- Firebase Hosting
- Any web server

## Project Structure

```
letter-adventure/
├── public/              # Static assets
│   ├── index.html      # HTML entry point
│   └── manifest.json   # PWA configuration
├── src/
│   ├── App.tsx         # Main React component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite build config
└── README.md           # This file
```

## How It Works

1. **Welcome Screen** - Enter your name
2. **Home Screen** - View progress and choose activities
3. **Daily Challenges** - Work through 10 progressive lessons
4. **Games** - Play 5 different letter-learning games
5. **Progress Tracking** - Earn stars and see completion % in real-time

### Data Storage

- Child's name: `localStorage["cname"]`
- Star count: `localStorage["cstars"]`
- Completed days: `localStorage["cdone"]` (JSON array)

Clear browser data to reset progress.

## Customization

### Change Colors
Edit the color codes in the `DAYS` array in [src/App.tsx](src/App.tsx#L10):
```javascript
{id:1, color:"#f59e0b", ...}  // Change #f59e0b to your color
```

### Add More Names / Content
Edit the `DAYS` array or create new game types in the GameRouter component.

### Modify Animations
Edit the `@keyframes` in the `<style>` tag within App.tsx.

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **HTML5 Canvas** - Letter tracing game

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Android Chrome

## License

Free to use and modify for personal or educational use.

## Tips for Teachers & Parents

- Start with **Flashcards** to introduce letters
- **Letter Hunt** makes it fun to find letters in names
- **Tracing** builds fine motor skills
- **Writing** reinforces letter formation
- **Memory** challenges recall and sequencing

---

Built with ❤️ for young learners
