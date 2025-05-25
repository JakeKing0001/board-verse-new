# Boardverse

## Project Overview

**Boardverse** is a web platform dedicated to board games, initially focusing on **chess**, designed to connect players of all levels in a unified digital space. The project aims to provide an engaging environment for playing chess online, solving puzzles, and interacting with friends and chess enthusiasts worldwide. Future expansions will include additional board games such as Checkers.

## Key Features

* **Multiple Gameplay Modes**:

  * **Player vs AI**: Play against Stockfish-powered AI.
  * **Local Multiplayer**: Two-player mode on a single device.
  * **Online PvP**: Real-time online matches with private and public lobbies.
  * **Chess Puzzles**: Solve predefined chess problems.

* **User Profile and Statistics**: Track games played, wins, and other performance metrics.

* **Authentication and User Management**: Secure registration and login with password hashing via bcryptjs.

* **Social Interaction**:

  * Friend system and real-time chat functionality.
  * Invite friends directly to private matches.

* **Real-time Updates**: Real-time synchronization of moves, chats, and notifications via Supabase.

* **Modern, Accessible UI**:

  * Responsive design.
  * Multi-language support (English, Italian, Spanish, French, German).
  * Dark and light theme options.
  * Integrated 3D animations with Three.js.

## Technologies Used

* **Frontend**: Next.js, React, Tailwind CSS, TypeScript, Three.js
* **Backend & Database**: Supabase (PostgreSQL, Authentication, Realtime)
* **AI Integration**: Stockfish Chess Engine API
* **UI Components**: Headless UI, Heroicons, Lucide Icons, Bootstrap Icons
* **Security**: bcryptjs for secure password handling

## Installation Guide

Follow these steps to set up Boardverse locally:

### Prerequisites

* Node.js (v18+ recommended)
* npm/yarn/pnpm

### Setup Instructions

```bash
git clone https://github.com/JakeKing0001/board-verse-new.git
cd board-verse-new
npm install
```

### Environment Configuration (optional)

Create a `.env.local` file if connecting to a custom Supabase instance:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anonymous-key
```

### Running the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
board-verse-new/
├── src/
│   ├── app/                  # Pages and API routes
│   ├── components/           # Reusable React components
│   ├── lib/                  # Supabase client setup
│   ├── public/               # Static files and models
│   ├── services/             # Client-side service functions
├── package.json              # Dependencies and scripts
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Documentation
```

## Contribution Guidelines

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch (`feature/your-feature`, `fix/your-bug`).
3. Commit clear and concise changes.
4. Submit a Pull Request detailing your changes.

Ensure your code passes ESLint (`npm run lint`) and follows existing code conventions.

## License

Currently, Boardverse is "All Rights Reserved". For usage inquiries, contact the repository maintainer directly. (Consider adding an open-source license like MIT or GPL in the future.)

## Contacts

* **Maintainer:** [JakeKing0001](https://github.com/JakeKing0001)
* **Issues & Discussions:** [GitHub Issues](https://github.com/JakeKing0001/board-verse-new/issues)
* **Supabase Documentation:** [Supabase Docs](https://supabase.com/docs)
* **Next.js Documentation:** [Next.js Docs](https://nextjs.org/docs)

---

*Thank you for contributing to Boardverse!*
