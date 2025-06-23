"use client";
import { useEffect, useState, useMemo } from 'react';
import {
  ProgressChart,
  PerformancePieChart,
  WeeklyActivityChart,
} from './charts/StatisticsCharts';
import NavBar from './NavBar';
import { usePieceContext } from './PieceContext';
import { getStatistics, type UserStatistics } from '../../../services/statistics';

type Stats = UserStatistics;

export default function Statistics() {
  const { user, t, darkMode } = usePieceContext();
  const [stats, setStats] = useState<Stats>({
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    challengesCompleted: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await getStatistics(user.id);
        setStats(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err : any) {
        console.error('Failed to fetch statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const progressData = useMemo(
    () => [
      { month: 'Gen', partite: 12, vittorie: 8 },
      { month: 'Feb', partite: 19, vittorie: 13 },
      { month: 'Mar', partite: 25, vittorie: 18 },
      { month: 'Apr', partite: 31, vittorie: 22 },
      { month: 'Mag', partite: 28, vittorie: 20 },
      { month: 'Giu', partite: 35, vittorie: 28 },
    ],
    []
  );

  const performanceData = useMemo(
    () => [
      { name: 'Vittorie', value: stats.challengesCompleted || 65, color: darkMode ? '#10b981' : '#059669' },
      { name: 'Sconfitte', value: (stats.matchesPlayed || 100) - (stats.challengesCompleted || 65), color: darkMode ? '#ef4444' : '#dc2626' },
    ],
    [stats, darkMode]
  );

  const weeklyData = useMemo(
    () => [
      { day: 'Lun', partite: 4 },
      { day: 'Mar', partite: 6 },
      { day: 'Mer', partite: 3 },
      { day: 'Gio', partite: 8 },
      { day: 'Ven', partite: 5 },
      { day: 'Sab', partite: 7 },
      { day: 'Dom', partite: 2 },
    ],
    []
  );

  const winRate = stats.matchesPlayed > 0 ? Math.round((stats.wins / stats.matchesPlayed) * 100) : 0;

  if (isLoading) {
    return (
      <>
        <div className={`fixed top-0 left-0 w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md z-50`}>
          <NavBar current={2} />
        </div>
        <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100'} pt-24 pb-16 flex items-center justify-center`}>
          <div className={`animate-spin h-12 w-12 border-4 ${darkMode ? 'border-slate-500' : 'border-green-500'} rounded-full border-t-transparent`}></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`fixed top-0 left-0 w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md z-50`}>
        <NavBar current={2} />
      </div>
      
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100 text-black'} pt-24 pb-16 px-4`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`${darkMode ? 'bg-slate-700' : 'bg-white/30'} backdrop-blur-md rounded-2xl p-6 shadow-lg mb-6`}>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-green-800'} mb-2`}>
              {t.statistics || 'Statistiche'}
            </h1>
            <p className="opacity-80">Analizza le tue performance e i tuoi progressi nel tempo</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium opacity-75 ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>
                    {t.matchesPlayed || 'Partite Giocate'}
                  </h3>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-green-800'}`}>
                    {stats.matchesPlayed}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <span className="text-2xl">🎮</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium opacity-75 ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>
                    {t.wins || 'Vittorie'}
                  </h3>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-800'}`}>
                    {stats.wins}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium opacity-75 ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>
                    Percentuale Vittorie
                  </h3>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {winRate}%
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium opacity-75 ${darkMode ? 'text-gray-300' : 'text-green-700'}`}>
                    {t.reward || 'Ricompense'}
                  </h3>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {stats.challengesCompleted}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <span className="text-2xl">🎁</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Progress Chart */}
            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-green-800'}`}>
                📈 Progressi Mensili
              </h3>
              <ProgressChart data={progressData} darkMode={darkMode} />
            </div>

            {/* Performance Pie Chart */}
            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-green-800'}`}>
                🎯 Performance Generale
              </h3>
              <PerformancePieChart data={performanceData} darkMode={darkMode} />
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">{t.wins || 'Vittorie'}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">{t.losses || 'Sconfitte'}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">{t.draws || 'Pareggi'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'} mb-8`}>
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-green-800'}`}>
              📅 Attività Settimanale
            </h3>
            <WeeklyActivityChart data={weeklyData} darkMode={darkMode} />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'}`}>
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-green-800'} flex items-center`}>
                ⚡ Streak Attuale
              </h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-orange-600'}`}>5 vittorie</p>
              <p className="text-sm opacity-75 mt-1">La tua serie più lunga: 12 vittorie</p>
            </div>

            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'}`}>
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-green-800'} flex items-center`}>
                ⏱️ Tempo Medio
              </h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>8:32</p>
              <p className="text-sm opacity-75 mt-1">Per partita completata</p>
            </div>

            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white/30 backdrop-blur-md'}`}>
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-green-800'} flex items-center`}>
                🏅 Ranking
              </h4>
              <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>#247</p>
              <p className="text-sm opacity-75 mt-1">Su 10,482 giocatori</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}