# 🎵 Vinyl Vault

A modern, feature-rich vinyl record collection management app built with Next.js. Track your collection, discover new music, and share what you're currently spinning.

## ✨ Features

### 📚 Collection Management
- **Personal Collection**: Add, edit, and organize your vinyl records
- **Wishlist**: Track records you want to buy
- **Advanced Filtering**: Sort by artist, title, year, or date added
- **Rich Metadata**: Store artist, title, year, genre, label, condition, and personal notes
- **High-Quality Artwork**: Automatic cover art fetching with manual refresh options
- **Import/Export**: Export your collection in multiple formats (Simple, Detailed, JSON)

### 🎧 Now Spinning
- **Currently Playing**: Mark what you're currently listening to
- **Real-time Updates**: See what's spinning across different views
- **Smart Context**: Different update strategies for personal vs. public views
- **Story Sharing**: Generate beautiful Instagram/Facebook story images
- **Kiosk Mode**: Full-screen display perfect for parties or record stores

### 🔍 Discovery & Search
- **Audio Recognition**: Identify songs by listening (AudD/ACRCloud integration)
- **Discogs Integration**: Search and import from Discogs marketplace
- **Auto-sync**: Bulk import from your Discogs collection
- **Smart Search**: Find records in your collection quickly

### 👥 Social Features
- **Public Profiles**: Share your collection with custom URLs (`/u/username`)
- **Collection Sharing**: Generate shareable collection exports
- **QR Codes**: Easy mobile access to collections
- **Guest Browsing**: Let others explore your collection

### 🎨 User Experience
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme detection in kiosk mode
- **Optimized Performance**: Client-side caching and smart data fetching
- **Stable Sorting**: No more jumping records during updates
- **PWA Ready**: Install as an app on your device

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Authentication**: Clerk
- **Audio Recognition**: AudD API, ACRCloud
- **Music Data**: Discogs API
- **Deployment**: Vercel
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database (recommend Neon)
- Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone https://github.com/imjoshnewton/vinyl-vault.git
cd vinyl-vault
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Audio Recognition (Optional)
AUDD_API_TOKEN=your_audd_token
# OR
ACRCLOUD_HOST=your_acrcloud_host
ACRCLOUD_ACCESS_KEY=your_acrcloud_access_key  
ACRCLOUD_ACCESS_SECRET=your_acrcloud_secret

# Discogs (Optional)
DISCOGS_USER_TOKEN=your_discogs_token
```

4. Set up the database:
```bash
bun run db:push
```

5. Start the development server:
```bash
bun run dev
```

Open [http://localhost:3003](http://localhost:3003) to see your application.

## 📖 Documentation

- [ACRCloud Setup Guide](./docs/ACRCLOUD_SETUP.md) - Free audio recognition setup
- [API Documentation](./docs/API.md) - Server actions and API routes
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions

## 🔧 Available Scripts

- `bun run dev` - Start development server (port 3003)
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run type-check` - Run TypeScript compiler
- `bun run db:push` - Push database schema changes
- `bun run db:studio` - Open Drizzle Studio

## 🎯 Key Features in Detail

### Audio Recognition
Uses WebRTC to capture audio from your microphone and identify songs using either:
- **AudD API**: High accuracy, 14-day trial
- **ACRCloud**: Free tier with 100 requests/day

### Now Spinning System
- **Collection Page**: Manual updates only (no polling)
- **Public Profiles**: 30-second polling for live updates
- **Kiosk Display**: Real-time updates for display purposes

### Collection Export
Export your collection in three formats:
- **Simple**: LLM-friendly list format
- **Detailed**: Complete metadata for sharing
- **JSON**: Structured data for developers

### Performance Optimizations
- Multi-level database sorting for stable record ordering
- Client-side caching with React Query
- Local storage caching layer
- Optimized image loading and CDN integration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Discogs](https://www.discogs.com) for comprehensive music metadata
- [AudD](https://audd.io) and [ACRCloud](https://www.acrcloud.com) for audio recognition
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Lucide](https://lucide.dev) for clean icons
