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

Below is an interactive flowchart of the main layers, components, and their interactions. Copy this block into your README and ensure your GitHub runner supports Mermaid.

flowchart TD
%% Layers
subgraph Frontend["Frontend Layer"]
direction TB
Browser["🌐 Browser"]:::client

        subgraph NextJS["Next.js Frontend"]
            direction TB
            Pages["📄 Pages (src/app)"]:::client
            Components["🧩 Components (src/app/components)"]:::client
            Services["⚙️ Services (services/*)"]:::client

            Browser -->|"renders"| Pages
            Pages -->|"uses"| Components
            Components -->|"calls"| Services
        end
    end

    subgraph Backend["Backend Layer"]
        direction TB
        subgraph APIs["API Routes"]
            direction TB
            AuthAPI["🔐 /api/login, /api/register, /api/settings"]:::backend
            FriendAPI["👥 /api/friend, /api/friendAccepted"]:::backend
            ChallengeAPI["⚔️ /api/challenge, /api/challengeComplete"]:::backend
            MessageAPI["💬 /api/messages"]:::backend
        end

        supabase["🗄️ Supabase\n(Auth, DB, Storage)"]:::external
    end

    subgraph Assets["Static Assets CDN"]
        direction TB
        Models["🎯 3D Models\n(public/models/*.glb)"]:::static
        Locales["🌍 Locale Files\n(public/locales/*.json)"]:::static
        Fonts["🔤 Fonts\n(public/fonts/*.json)"]:::static
    end

    %% Interactions
    Services -->|"HTTP Calls"| AuthAPI
    Services -->|"API Requests"| FriendAPI
    Services -->|"Challenge Data"| ChallengeAPI
    Services -->|"Chat Messages"| MessageAPI

    AuthAPI -->|"uses lib/supabase.js"| supabase
    FriendAPI -->|"uses lib/supabase.js"| supabase
    ChallengeAPI -->|"uses lib/supabase.js"| supabase
    MessageAPI -->|"uses lib/supabase.js"| supabase

    Browser -.->|"fetches"| Models
    Browser -.->|"fetches"| Locales
    Browser -.->|"fetches"| Fonts

    %% Click Events - Pages
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/page.tsx" "Homepage"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/about/page.tsx" "About Page"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/login/page.tsx" "Login Page"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/register/page.tsx" "Register Page"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/profile/page.tsx" "Profile Page"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/chessboard/page.tsx" "Chess Board"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/friends/page.tsx" "Friends Page"

    %% Click Events - Components
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/ChessBoard.tsx" "Chess Board Component"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/NavBar.tsx" "Navigation Bar"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/Friends.tsx" "Friends Component"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/Challenge.tsx" "Challenge Component"

    %% Click Events - Services
    click Services "https://github.com/jakeking0001/board-verse-new/blob/master/services/auth.ts" "Auth Service"
    click Services "https://github.com/jakeking0001/board-verse-new/blob/master/services/friends.ts" "Friends Service"
    click Services "https://github.com/jakeking0001/board-verse-new/blob/master/services/challenge.ts" "Challenge Service"

    %% Click Events - API Routes
    click AuthAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/login/route.js" "Login API"
    click FriendAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/friend/route.ts" "Friend API"
    click ChallengeAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/challenge/route.ts" "Challenge API"
    click MessageAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/messages/route.ts" "Messages API"

    %% Click Events - External Services
    click supabase "https://github.com/jakeking0001/board-verse-new/blob/master/lib/supabase.js" "Supabase Configuration"

    %% Enhanced Styles with gradients and modern design
    classDef client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#0d47a1,font-weight:bold
    classDef backend fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#1b5e20,font-weight:bold
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100,font-weight:bold
    classDef static fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c,font-weight:bold

    %% Subgraph styling
    style Frontend fill:#f8f9ff,stroke:#3f51b5,stroke-width:3px
    style Backend fill:#f1f8e9,stroke:#4caf50,stroke-width:3px
    style Assets fill:#fce4ec,stroke:#e91e63,stroke-width:3px
    style NextJS fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px
    style APIs fill:#e0f2f1,stroke:#009688,stroke-width:2px

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

- **Player vs. AI:** Select “Play vs AI” from the menu.
- **Multiplayer:** Create or join a lobby (public or private).
- **Puzzles:** Access daily puzzles from the “Challenges” section.
- **Profile:** View your stats and game history under “Profile.”
- **Settings:** Toggle language, theme, and notification preferences.

## Testing

- **Linting:**

  npm run lint

- **Unit & Integration Tests:**

  npm run test

- **End-to-End Tests (if available):**

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

- **Repository:** [https://github.com/JakeKing0001/board-verse-new](https://github.com/JakeKing0001/board-verse-new)
- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Stockfish API:** [https://stockfishchess.org/](https://stockfishchess.org/)
