# ThoughtBubble Messaging App

ThoughtBubble is an intimate messaging application designed exclusively for couples to share emoticons and thought bubbles. The app emphasizes simplicity and personal connection, requiring users to know their partner's username to send messages.

## Features

- User authentication (register/login)
- Send emoticons or thought bubble messages
- Real-time messaging via WebSockets
- Message history tracking
- Notifications for unread messages

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **Database**: In-memory storage (can be adapted for persistent databases)
- **Real-time Communication**: WebSockets (ws)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/thoughtbubble.git
cd thoughtbubble
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Deployment

This application can be deployed to various platforms:

### GitHub Pages (Frontend Only)

For a frontend-only version:

1. Update the vite.config.ts to include your repository base path
2. Build the project
```bash
npm run build
```
3. Deploy to GitHub Pages
```bash
npm run deploy
```

### Full-Stack Deployment

For deploying the full application (backend + frontend):

1. Deploy to a service like Heroku, Vercel, or Railway that supports Node.js applications
2. Set up environment variables as needed
3. For the database, consider migrating to a persistent solution like PostgreSQL

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.