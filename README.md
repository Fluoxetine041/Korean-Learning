# English Learning App

An interactive application for English learners to read articles and improve their vocabulary.

## Features

- Browse articles by difficulty level and category
- Text-to-speech functionality with word highlighting
- Word definition lookup by clicking on words
- Dark/light theme support
- User preferences and progress tracking
- Responsive design for all devices

## Technology Stack

- Vue.js 3 with Nuxt.js
- TypeScript
- PostgreSQL 16 database
- Prisma ORM for type-safe database access
- Docker for development environment

## Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose

### Database Setup

1. Start the PostgreSQL database using Docker Compose:

```bash
cd english-learning-app
docker-compose up -d
```

This will:
- Start a PostgreSQL 16 database on port 5432
- Set up the database schema automatically using the init scripts
- Start Adminer (a lightweight database management tool) on http://localhost:64549
  - System: PostgreSQL
  - Server: postgres
  - Username: postgres
  - Password: postgres
  - Database: english_learning

2. Generate Prisma client:

```bash
npx prisma generate
```

### Application Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Create a `.env` file based on the `.env.example` file.

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Access the application at [http://localhost:3000](http://localhost:3000).

## Database Schema & Prisma

The application uses Prisma ORM to interact with the PostgreSQL database. Prisma provides:
- Type-safe database access
- Auto-generated TypeScript models based on your schema
- Easy-to-use API for queries and transactions
- Database migrations

Main models include:
- `User` - User accounts and preferences
- `Article` - Article content with metadata
- `Author` - Article authors
- `Word` - Dictionary words with meanings, definitions and synonyms
- `UserProgress` - Tracks reading progress by article
- `UserWordHistory` - Tracks word lookups

You can explore the database schema in the `prisma/schema.prisma` file.

## API Endpoints

The application provides the following API endpoints:

- `GET /api/articles` - Get a list of all articles
- `GET /api/articles/:id` - Get a single article by ID
- `GET /api/dictionary/:word` - Look up a word in the dictionary
- `GET /api/user` - Get current user information and preferences
- `PUT /api/user/preferences` - Update user preferences
- `POST /api/user/progress` - Track user reading progress
- `POST /api/user/word-history` - Track word lookups

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
