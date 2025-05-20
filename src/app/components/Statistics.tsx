"use client";

import Link from "next/link";
import NavBar from "./NavBar";
import { useState, useEffect } from "react";
import { usePieceContext } from "./PieceContext";
import toast from "react-hot-toast";

const Statistics = () => {
  const { isLoggedIn, user, t, darkMode } = usePieceContext();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'games', 'tournaments', 'achievements'
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'year', 'all'
  const [chartType, setChartType] = useState('rating'); // 'rating', 'wins', 'games'

  const stats = {
    overview: {
      rating: 1842,
      bestRating: 2018,
      gamesPlayed: 873,
      wins: 412,
      draws: 205,
      losses: 256,
      winPercentage: 47.2,
      drawPercentage: 23.5,
      lossPercentage: 29.3,
      averageOpponentRating: 1826,
      openings: [
        { name: "Sicilian Defense", count: 143, winRate: 52 },
        { name: "Queen's Gambit", count: 116, winRate: 48 },
        { name: "Ruy Lopez", count: 98, winRate: 46 },
        { name: "French Defense", count: 87, winRate: 51 },
        { name: "King's Indian", count: 76, winRate: 43 }
      ],
      ratingProgress: [
        { date: '2024-01', rating: 1684 },
        { date: '2024-02', rating: 1710 },
        { date: '2024-03', rating: 1756 },
        { date: '2024-04', rating: 1731 },
        { date: '2024-05', rating: 1793 },
        { date: '2024-06', rating: 1842 }
      ]
    },
    games: [
      { id: 1, opponent: "MasterChess84", opponentRating: 1876, result: "win", date: "2024-06-15", moves: 34, opening: "Sicilian Defense" },
      { id: 2, opponent: "QueenSlayer", opponentRating: 1921, result: "loss", date: "2024-06-13", moves: 42, opening: "Queen's Gambit" },
      { id: 3, opponent: "KnightRider", opponentRating: 1802, result: "win", date: "2024-06-10", moves: 28, opening: "Ruy Lopez" },
      { id: 4, opponent: "BishopMaster", opponentRating: 1856, result: "draw", date: "2024-06-08", moves: 56, opening: "French Defense" },
      { id: 5, opponent: "RookDefender", opponentRating: 1764, result: "win", date: "2024-06-05", moves: 37, opening: "King's Indian" },
      { id: 6, opponent: "PawnStorm", opponentRating: 1834, result: "draw", date: "2024-06-02", moves: 41, opening: "Vienna Game" },
      { id: 7, opponent: "CheckmatePro", opponentRating: 1893, result: "loss", date: "2024-05-29", moves: 31, opening: "Scotch Game" },
      { id: 8, opponent: "EndgameGuru", opponentRating: 1912, result: "win", date: "2024-05-26", moves: 47, opening: "Sicilian Defense" }
    ],
    tournaments: [
      { id: 1, name: "Spring Chess Open 2024", date: "2024-05-20", position: 3, participants: 64, ratingChange: +28 },
      { id: 2, name: "City Championship", date: "2024-04-15", position: 5, participants: 32, ratingChange: +12 },
      { id: 3, name: "Online Chess League Season 8", date: "2024-03-10", position: 8, participants: 128, ratingChange: -5 },
      { id: 4, name: "Winter Chess Classic", date: "2024-02-05", position: 2, participants: 48, ratingChange: +35 },
      { id: 5, name: "National Amateur Challenge", date: "2024-01-18", position: 12, participants: 96, ratingChange: +8 }
    ],
    achievements: [
      { id: 1, name: "Streak Master", description: "Win 5 games in a row", date: "2024-06-02", icon: "🏆" },
      { id: 2, name: "Opening Scholar", description: "Play 100 different opening variations", date: "2024-05-15", icon: "📚" },
      { id: 3, name: "Blitz Champion", description: "Win a blitz tournament", date: "2024-04-20", icon: "⚡" },
      { id: 4, name: "Comeback King", description: "Win a game after being down material", date: "2024-03-28", icon: "👑" },
      { id: 5, name: "Endgame Wizard", description: "Win 50 games in the endgame phase", date: "2024-03-05", icon: "🧙" },
      { id: 6, name: "Tactical Genius", description: "Execute 25 successful forks or pins", date: "2024-02-17", icon: "🧠" },
      { id: 7, name: "1800 Club", description: "Reach a rating of 1800", date: "2024-02-02", icon: "🌟" },
      { id: 8, name: "Puzzle Solver", description: "Solve 500 chess puzzles", date: "2024-01-10", icon: "🧩" }
    ]
  };

  // Get result color based on game result
  const getResultColor = (result : string) => {
    switch (result) {
      case 'win': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'loss': return darkMode ? 'text-red-400' : 'text-red-600';
      case 'draw': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      default: return '';
    }
  };

  // Rating chart visualization
  const renderRatingChart = () => {
    const chartData = stats.overview.ratingProgress;
    const maxRating = Math.max(...chartData.map(item => item.rating));
    const minRating = Math.min(...chartData.map(item => item.rating));
    const range = maxRating - minRating;
    const padding = range * 0.1;
    
    return (
      <div className="h-64 mt-6 relative">
        <div className="absolute inset-0 flex items-end">
          {chartData.map((item, index) => {
            const height = ((item.rating - minRating + padding) / (range + padding * 2)) * 100;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-full mx-1 rounded-t-md ${darkMode ? 'bg-blue-500' : 'bg-green-500'}`} 
                  style={{ height: `${height}%` }}
                >
                </div>
                <div className="text-xs mt-2 rotate-45 origin-top-left translate-x-4">{item.date}</div>
              </div>
            );
          })}
        </div>
        
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs">
          <span>{maxRating + Math.round(padding)}</span>
          <span>{Math.round((maxRating + minRating) / 2)}</span>
          <span>{minRating - Math.round(padding)}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`fixed top-0 left-0 w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md z-50`}>
        <NavBar current={2} />
      </div>

      <div className={`fixed inset-0 flex flex-col items-center ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100 text-green-800'} pt-24 overflow-hidden`}>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-80 h-80 ${darkMode ? 'bg-slate-700' : 'bg-green-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`}></div>
          <div className={`absolute top-1/3 right-1/3 w-96 h-96 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700`}></div>
          <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 ${darkMode ? 'bg-slate-800' : 'bg-green-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000`}></div>
          <div className={`absolute bottom-1/3 right-1/4 w-64 h-64 ${darkMode ? 'bg-slate-700' : 'bg-amber-100'} rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-500`}></div>
        </div>

        {/* Main content */}
        <div className="z-10 w-full max-w-5xl px-4 flex flex-col items-center pb-8 overflow-y-auto">
          <h1 className="text-5xl font-bold mb-8 tracking-tight">
            {t?.profileStats || "Profile Statistics"}
          </h1>

          {/* Profile summary */}
          <div className={`w-full max-w-4xl ${darkMode ? 'bg-slate-800' : 'bg-white/40'} backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 border ${darkMode ? 'border-slate-700' : 'border-white/50'}`}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-green-200'} border-4 ${darkMode ? 'border-blue-500' : 'border-green-500'} overflow-hidden`}>
                  <img 
                    src={user?.avatar || "https://via.placeholder.com/128"} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute -bottom-2 -right-2 text-xl px-3 py-1 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-green-600'} text-white font-bold flex items-center`}>
                  {stats.overview.rating}
                </div>
              </div>
              
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">{user?.username || "ChessMaster"}</h2>
                <p className="text-lg opacity-80 mb-4">{t?.playerSince || "Player since"} 2023</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                    <div className="text-sm opacity-70">{t?.gamesPlayed || "Games"}</div>
                    <div className="text-xl font-bold">{stats.overview.gamesPlayed}</div>
                  </div>
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                    <div className="text-sm opacity-70">{t?.winRate || "Win Rate"}</div>
                    <div className="text-xl font-bold">{stats.overview.winPercentage}%</div>
                  </div>
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                    <div className="text-sm opacity-70">{t?.bestRating || "Best Rating"}</div>
                    <div className="text-xl font-bold">{stats.overview.bestRating}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="w-full max-w-4xl mb-6 flex border-b overflow-x-auto no-scrollbar">
            <button
              className={`py-3 px-4 font-medium text-lg whitespace-nowrap ${activeTab === 'overview' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t?.overview || "Overview"}
            </button>
            <button
              className={`py-3 px-4 font-medium text-lg whitespace-nowrap ${activeTab === 'games' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
              onClick={() => setActiveTab('games')}
            >
              {t?.recentGames || "Recent Games"}
            </button>
            <button
              className={`py-3 px-4 font-medium text-lg whitespace-nowrap ${activeTab === 'tournaments' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
              onClick={() => setActiveTab('tournaments')}
            >
              {t?.tournaments || "Tournaments"}
            </button>
            <button
              className={`py-3 px-4 font-medium text-lg whitespace-nowrap ${activeTab === 'achievements' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              {t?.achievements || "Achievements"}
            </button>
          </div>

          {/* Tab content */}
          <div className={`w-full max-w-4xl ${darkMode ? 'bg-slate-800' : 'bg-white/40'} backdrop-blur-md rounded-3xl shadow-2xl p-8 border ${darkMode ? 'border-slate-700' : 'border-white/50'}`}>
            {activeTab === 'overview' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    {t?.statisticsOverview || "Statistics Overview"}
                  </h2>
                  
                  <div className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                    <button 
                      className={`px-3 py-1 text-sm ${timeRange === 'week' ? darkMode ? 'bg-blue-600 text-white' : 'bg-green-600 text-white' : ''}`}
                      onClick={() => setTimeRange('week')}
                    >
                      {t?.week || "Week"}
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm ${timeRange === 'month' ? darkMode ? 'bg-blue-600 text-white' : 'bg-green-600 text-white' : ''}`}
                      onClick={() => setTimeRange('month')}
                    >
                      {t?.month || "Month"}
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm ${timeRange === 'year' ? darkMode ? 'bg-blue-600 text-white' : 'bg-green-600 text-white' : ''}`}
                      onClick={() => setTimeRange('year')}
                    >
                      {t?.year || "Year"}
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm ${timeRange === 'all' ? darkMode ? 'bg-blue-600 text-white' : 'bg-green-600 text-white' : ''}`}
                      onClick={() => setTimeRange('all')}
                    >
                      {t?.allTime || "All Time"}
                    </button>
                  </div>
                </div>

                {/* Rating graph */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{t?.ratingProgress || "Rating Progress"}</h3>
                    <div className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-white/60'} text-xs`}>
                      <button 
                        className={`px-2 py-1 ${chartType === 'rating' ? darkMode ? 'bg-blue-600 text-white' : 'bg-green-600 text-white' : ''}`}
                        onClick={() => setChartType('rating')}
                      >
                        {t?.rating || "Rating"}
                      </button>
                      <button 
                        className={`px-2 py-1 ${chartType === 'wins' ? darkMode ? 'bg-blue-600 text-white' : 'bg-green-600 text-white' : ''}`}
                        onClick={() => setChartType('wins')}
                      >
                        {t?.wins || "Wins"}
                      </button>
                      <button 
                        className={`px-2 py-1 ${chartType === 'games' ? darkMode ? 'bg-blue-600 text-white' : 'bg-green-600 text-white' : ''}`}
                        onClick={() => setChartType('games')}
                      >
                        {t?.games || "Games"}
                      </button>
                    </div>
                  </div>
                  
                  {renderRatingChart()}
                </div>

                {/* Stats grid */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Game results stats */}
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                    <h3 className="font-medium mb-4">{t?.gameResults || "Game Results"}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className={`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700`}>
                          <div className={`h-2.5 rounded-full ${darkMode ? 'bg-green-500' : 'bg-green-600'}`} style={{ width: `${stats.overview.winPercentage}%` }}></div>
                        </div>
                        <span className="ml-2 text-sm font-medium whitespace-nowrap">{stats.overview.wins} {t?.wins || "Wins"} ({stats.overview.winPercentage}%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700`}>
                          <div className={`h-2.5 rounded-full ${darkMode ? 'bg-yellow-500' : 'bg-yellow-600'}`} style={{ width: `${stats.overview.drawPercentage}%` }}></div>
                        </div>
                        <span className="ml-2 text-sm font-medium whitespace-nowrap">{stats.overview.draws} {t?.draws || "Draws"} ({stats.overview.drawPercentage}%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700`}>
                          <div className={`h-2.5 rounded-full ${darkMode ? 'bg-red-500' : 'bg-red-600'}`} style={{ width: `${stats.overview.lossPercentage}%` }}></div>
                        </div>
                        <span className="ml-2 text-sm font-medium whitespace-nowrap">{stats.overview.losses} {t?.losses || "Losses"} ({stats.overview.lossPercentage}%)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Favorite openings */}
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                    <h3 className="font-medium mb-4">{t?.favoriteOpenings || "Favorite Openings"}</h3>
                    <div className="space-y-3">
                      {stats.overview.openings.slice(0, 4).map((opening, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="text-sm">{opening.name}</div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs opacity-70">{opening.count} {t?.games || "games"}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${opening.winRate >= 50 ? darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800' : darkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800'}`}>
                              {opening.winRate}% {t?.winRate || "win rate"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'games' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  {t?.recentGames || "Recent Games"}
                </h2>

                <div className="space-y-4">
                  {stats.games.map((game) => (
                    <div
                      key={game.id}
                      className={`p-4 rounded-xl transition-all duration-300 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white/80'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            game.result === 'win' ? darkMode ? 'bg-green-800' : 'bg-green-100' :
                            game.result === 'loss' ? darkMode ? 'bg-red-800' : 'bg-red-100' :
                            darkMode ? 'bg-yellow-800' : 'bg-yellow-100'
                          }`}>
                            <span className={`text-xl font-bold ${getResultColor(game.result)}`}>
                              {game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-bold">{game.opponent}</h3>
                              <span className="ml-2 text-sm opacity-70">({game.opponentRating})</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="opacity-70">{game.opening} • {game.moves} {t?.moves || "moves"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-sm opacity-70">{game.date}</span>
                          <button
                            className={`mt-1 px-3 py-1 rounded-full text-xs ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800'} transition-colors`}
                          >
                            {t?.viewGame || "View Game"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    className={`px-4 py-2 rounded-full text-sm ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white'} transition-all`}
                  >
                    {t?.loadMore || "Load More Games"}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'tournaments' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  {t?.tournamentHistory || "Tournament History"}
                </h2>

                <div className="space-y-4">
                  {stats.tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className={`p-4 rounded-xl transition-all duration-300 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white/80'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold">{tournament.name}</h3>
                          <div className="flex items-center text-sm mt-1">
                            <span className="opacity-70">{tournament.date}</span>
                            <span className="mx-2">•</span>
                            <span>{tournament.participants} {t?.participants || "participants"}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tournament.position <= 3 ? darkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800' :
                              darkMode ? 'bg-slate-600 text-slate-200' : 'bg-gray-100 text-gray-800'
                            } font-bold`}>
                              {tournament.position}
                            </div>
                            <span className={`ml-2 text-sm ${
                              tournament.ratingChange > 0 ? darkMode ? 'text-green-400' : 'text-green-600' :
                              darkMode ? 'text-red-400' : 'text-red-600'
                            }`}>
                              {tournament.ratingChange > 0 ? '+' : ''}{tournament.ratingChange}
                            </span>
                          </div>
                          <button
                            className={`mt-2 px-3 py-1 rounded-full text-xs ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800'} transition-colors`}
                          >
                            {t?.details || "Details"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'achievements' && (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  {t?.achievements || "Achievements"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'} flex items-center`}
                    >
                      <div className="w-12 h-12 rounded-full bg-opacity-30 flex items-center justify-center text-2xl mr-4">
                        {achievement.icon}
                      </div>
                      <div>
                        <h3 className="font-bold">{achievement.name}</h3>
                        <p className="text-sm opacity-70">{achievement.description}</p>
                        <p className="text-xs mt-1 opacity-60">{t?.achieved || "Achieved"}: {achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'} text-center`}>
                  <p className="opacity-70">{t?.completedAchievements || "Completed"} 8/24 {t?.achievements.toLowerCase() || "achievements"}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                    <div className={`h-2.5 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-green-600'}`} style={{ width: '33%' }}></div>
                  </div>
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                className={`px-6 py-3 rounded-xl font-medium flex items-center ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} transition-all`}
                onClick={() => toast.success(t?.analysisStarted || "Analysis started! We'll notify you when it's ready.")}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                {t?.analyzeGames || "Analyze Games"}
              </button>
              
              <button
                className={`px-6 py-3 rounded-xl font-medium flex items-center ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white'} transition-all`}
                onClick={() => toast.success(t?.downloadStarted || "Download started! Your report will be ready soon.")}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                {t?.exportStats || "Export Stats"}
              </button>
              
              <button
                className={`px-6 py-3 rounded-xl font-medium flex items-center ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white'} transition-all`}
                onClick={() => toast(t?.sharingOptions || "Sharing options", { icon: '🔗' })}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                {t?.share || "Share"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress/Rating comparison modal (hidden by default) */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-0 pointer-events-none`}>
        <div className={`relative max-w-lg w-full mx-4 p-6 rounded-2xl shadow-2xl transform transition-transform duration-300 scale-95 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-green-800'}`}>
          <button className={`absolute top-4 right-4 p-1 rounded-full ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <h3 className="text-2xl font-bold mb-6">{t?.ratingComparison || "Rating Comparison"}</h3>
          
          <div className="h-64 mb-6 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-end p-4">
            {/* Placeholder for chart */}
            <div className="w-full h-full flex items-center justify-center">
              <span className="opacity-50">{t?.comparisonChart || "Detailed comparison chart"}</span>
            </div>
          </div>
          
          <p className="text-sm opacity-70 mb-6">
            {t?.comparisonExplanation || "Compare your rating progression against players of similar skill level. This helps you understand your growth trajectory and identify areas for improvement."}
          </p>

          <div className="flex justify-end">
            <button className={`px-6 py-2 rounded-full font-medium ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-green-800 hover:bg-green-50'}`}>
              {t?.close || "Close"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;