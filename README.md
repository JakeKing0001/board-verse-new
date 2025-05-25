# Boardverse

Boardverse is a web platform dedicated to board games (initially focusing on **chess**), designed to connect players of all skill levels in a unified digital space. It lets users play chess online, solve puzzles, and interact with friends or other enthusiasts worldwide. Future expansions (e.g., adding games like Checkers) are planned.

## Key Features

- **Gameplay modes**  
  - Player vs. AI (using Stockfish chess engine)  
  - Local multiplayer on one device  
  - Online PvP matches (private or public lobbies)  
  - Chess puzzles and challenges

- **User profiles & stats**  
  Track games played, wins, losses, ratings, and other performance metrics.

- **Authentication & security**  
  Secure user registration and login with password hashing via `bcryptjs`.

- **Social interaction**  
  Friend system and real-time chat; invite friends directly into private matches.

- **Real-time updates**  
  Game moves, chat messages, and notifications synchronized via Supabase Realtime.

- **Modern UI**  
  Responsive design, multi-language support (EN, IT, ES, FR, DE), dark/light themes, and integrated 3D animations with Three.js.

- **Tech stack**  
  - **Frontend:** Next.js (React, TypeScript, Tailwind CSS, Three.js)  
  - **Backend & Database:** Supabase (PostgreSQL, Auth, Realtime)  
  - **AI Engine:** Stockfish Chess Engine API  
  - **UI Libraries:** Headless UI, Heroicons

## Architecture & Interactive Diagram

Boardverse follows a standard Next.js project structure under `src/`. The main components and data flows are illustrated below using **Mermaid** (v11.4.1):

graph LR
    Client["User’s Browser"]
    NextApp["Boardverse Frontend<br>(Next.js + React)"]
    Supabase["Supabase<br>(Auth, Realtime)"]
    Database["PostgreSQL<br>(Supabase DB)"]
    Stockfish["Stockfish<br>Chess AI"]

    Client --> NextApp
    NextApp --> Supabase
    NextApp --> Stockfish
    Supabase --> Database

* **Client** (user’s browser) ↔ **NextApp** (UI & API routes)
* **NextApp** ↔ **Supabase** (authentication, database storage, real-time sync)
* **NextApp** ↔ **Stockfish** (AI move generation)
* **Supabase** ↔ **Database** (persistent game state, user data, chat)

## Installation

1. **Clone the repository**

  git clone https://github.com/JakeKing0001/board-verse-new.git
  cd board-verse-new

2. **Install dependencies**

   npm install
   # or
   yarn
   # or
   pnpm install

3. **Configure environment**
   Create a `.env.local` file in the project root:

   NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>

4. **Run the development server**

   npm run dev
   # or
   yarn dev
   # or
   pnpm dev

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage

* **Player vs. AI:** Select “Play vs AI” from the menu.
* **Multiplayer:** Create or join a lobby (public or private).
* **Puzzles:** Access daily puzzles from the “Challenges” section.
* **Profile:** View your stats and game history under “Profile.”
* **Settings:** Toggle language, theme, and notification preferences.

## Testing

* **Linting:**

  npm run lint

* **Unit & Integration Tests:**

  npm run test

* **End-to-End Tests (if available):**

  npm run e2e


## Contributing

1. **Fork** the repo
2. **Create a branch** (`git checkout -b feature/my-feature`)
3. **Commit** your changes (`git commit -m "Add new feature"`)
4. **Push** to your fork (`git push origin feature/my-feature`)
5. **Open a Pull Request**

Please ensure code follows existing conventions and passes lint/tests before submitting.

## License

All rights reserved. For licensing inquiries, please contact the maintainer.

## Useful Links

* **Repository:** [https://github.com/JakeKing0001/board-verse-new](https://github.com/JakeKing0001/board-verse-new)
* **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
* **Next.js Docs:** [https://nextjs.org/docs](https://nextjs.org/docs)
* **Stockfish API:** [https://stockfishchess.org/](https://stockfishchess.org/)