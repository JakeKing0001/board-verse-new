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
    subgraph "Frontend Layer"
        direction TB
        Browser["Browser"]:::client

        subgraph "Next.js Frontend"
            direction TB
            Pages["Pages (src/app)"]:::client
            Components["Components (src/app/components)"]:::client
            Services["Services (services/*)"]:::client

            Browser -->|"renders"| Pages
            Pages -->|"uses"| Components
            Components -->|"calls"| Services
        end
    end

    subgraph "Backend Layer"
        direction TB
        subgraph "API Routes"
            direction TB
            AuthAPI["/api/login, /api/register, /api/settings"]:::backend
            FriendAPI["/api/friend, /api/friendAccepted"]:::backend
            ChallengeAPI["/api/challenge, /api/challengeComplete"]:::backend
            MessageAPI["/api/messages"]:::backend
        end

        supabase["Supabase\n(Auth, DB, Storage)"]:::external
    end

    subgraph "Static Assets CDN"
        direction TB
        Models["3D Models\n(public/models/*.glb)"]:::static
        Locales["Locale Files\n(public/locales/*.json)"]:::static
        Fonts["Fonts\n(public/fonts/*.json)"]:::static
    end

    %% Interactions
    Services -->|"HTTP Calls"| AuthAPI
    Services -->|""| FriendAPI
    Services -->|""| ChallengeAPI
    Services -->|""| MessageAPI

    AuthAPI -->|"uses lib/supabase.js"| supabase
    FriendAPI -->|"uses lib/supabase.js"| supabase
    ChallengeAPI -->|"uses lib/supabase.js"| supabase
    MessageAPI -->|"uses lib/supabase.js"| supabase

    Browser -->..|"fetches"| Models
    Browser -->..|"fetches"| Locales
    Browser -->..|"fetches"| Fonts

    %% Click Events
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/about/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/login/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/register/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/forgot-password/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/profile/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/online/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/chooseTime/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/challenge/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/chessboard/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/friends/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/settingsProfile/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/statistics/page.tsx"
    click Pages "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/not-found.tsx"

    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/NavBar.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/SideBar.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/MainPage.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/ErrorPage.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/LoginPage.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/RegisterPage.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/ForgotPasswordPage.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/SettingProfile.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/MyProfile.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/ChessBoard.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/Piece.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/PieceContext.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/ChessMoves.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/ChessTimer.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/PromotionModal.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/TimerModal.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/CheckMateModal.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/MovesModal.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/Friends.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/FriendsChatModal.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/Challenge.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/Statistics.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/RenderModel.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/models/Pawn.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/models/Trophy.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/components/StockFishComponent.tsx"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/stockFishUtils.ts"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/checkMateLogic.ts"
    click Components "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/pieceLogic.ts"

    click Services "https://github.com/jakeking0001/board-verse-new/blob/master/services/auth.ts"
    click Services "https://github.com/jakeking0001/board-verse-new/blob/master/services/login.ts"
    click Services "https://github.com/jakeking0001/board-verse-new/blob/master/services/friends.ts"
    click Services "https://github.com/jakeking0001/board-verse-new/blob/master/services/challenge.ts"
    click Services "https://github.com/jakeking0001/board-verse-new/blob/master/services/challengeComplete.ts"
    click Services "https://github.com/jakeking0001/board-verse-new/blob/master/services/messages.ts"

    click AuthAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/login/route.js"
    click AuthAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/register/route.ts"
    click AuthAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/settings/route.js"
    click FriendAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/friend/route.ts"
    click FriendAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/friendAccepted/route.ts"
    click ChallengeAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/challenge/route.ts"
    click ChallengeAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/challengeComplete/route.ts"
    click MessageAPI "https://github.com/jakeking0001/board-verse-new/blob/master/src/app/api/messages/route.ts"

    click supabase "https://github.com/jakeking0001/board-verse-new/blob/master/lib/supabase.js"

    %% Styles
    classDef client fill:#D0E8FF,stroke:#0366d6,color:#0366d6
    classDef backend fill:#DFFFE0,stroke:#28a745,color:#28a745
    classDef external fill:#FFE8A0,stroke:#DB8B00,color:#DB8B00
    classDef static fill:#F0F0F0,stroke:#A0A0A0,color:#666666

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
