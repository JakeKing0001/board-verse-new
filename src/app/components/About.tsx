"use client";

import Link from "next/link";
import NavBar from "./NavBar";
import { usePieceContext } from "./PieceContext";
import { useState } from "react";

const AboutPage = () => {
  const { darkMode, t } = usePieceContext();
  const [activeTab, setActiveTab] = useState('story'); // 'story', 'team', or 'mission'

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Davide Pesino",
      role: t.grandmaster || "Program Manager",
      avatar: "/Pesino Davide.jpeg",
      bio: t.alessandroBio || "Responsible for overall project management and development."
    }
  ];

  // Milestones data
  const milestones = [
    {
      year: "2024",
      event: t.founding || "Founding of BoardVerse",
      description: t.foundingDesc || "The BoardVerse project was founded by only Davide Pesino."
    },
    {
      year: "2025",
      event: t.launch || "Launch of BoardVerse",
      description: t.launchDesc || "The BoardVerse project was launched with a focus on chess."
    }
  ];

  return (
    <>
      <div className={`fixed top-0 left-0 w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md z-50`}>
        <NavBar current={5} />
      </div>

      <div className={`fixed inset-0 flex flex-col items-center ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-green-100 via-amber-50 to-green-100 text-green-800'} pt-24 overflow-auto`}>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-80 h-80 ${darkMode ? 'bg-slate-700' : 'bg-green-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`}></div>
          <div className={`absolute top-1/3 right-1/3 w-96 h-96 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700`}></div>
          <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 ${darkMode ? 'bg-slate-800' : 'bg-green-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000`}></div>
          <div className={`absolute bottom-1/3 right-1/4 w-64 h-64 ${darkMode ? 'bg-slate-700' : 'bg-amber-100'} rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-500`}></div>
        </div>

        {/* Main content */}
        <div className="z-10 w-full max-w-5xl px-4 flex flex-col items-center pb-20">
          <h1 className="text-5xl font-bold mb-8 tracking-tight">
            {t.aboutUs || "About BoardVerse"}
          </h1>

          {/* Chess pieces icon */}
          <div className="mb-10 flex items-center justify-center space-x-2">
            <div className={`w-8 h-8 ${darkMode ? 'text-white' : 'text-green-800'}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17,2H7V4H9V7H7V12H12V9H15V16H10V19L7,22H17L14,19V16H9V14H15V11H18V7H16V4H17V2Z" />
              </svg>
            </div>
            <div className={`w-8 h-8 ${darkMode ? 'text-gray-300' : 'text-amber-700'}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12,2A3,3 0 0,1 15,5V6H9V5A3,3 0 0,1 12,2M19,6A2,2 0 0,1 21,8V10A2,2 0 0,1 19,12H18L15,20H9L6,12H5A2,2 0 0,1 3,10V8A2,2 0 0,1 5,6H19Z" />
              </svg>
            </div>
            <div className={`w-8 h-8 ${darkMode ? 'text-white' : 'text-green-800'}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19,22H5V20H19V22M17.16,8.26C18.22,9.63 18.86,11.28 19,13C19,15.76 15.87,18 12,18C8.13,18 5,15.76 5,13C5.14,11.28 5.78,9.63 6.84,8.26C8.34,6.22 10.24,5 12,5C13.76,5 15.66,6.22 17.16,8.26M12,7C10.4,7 8.85,8.11 7.5,10.26C6.92,11.17 6.56,12.27 6.5,13C6.5,14.79 8.97,16 12,16C15.03,16 17.5,14.79 17.5,13C17.44,12.27 17.08,11.17 16.5,10.26C15.15,8.11 13.6,7 12,7Z" />
              </svg>
            </div>
          </div>

          {/* Tabs */}
          <div className="w-full max-w-4xl mb-6 flex border-b">
            <button
              className={`flex-1 py-3 font-medium text-lg ${activeTab === 'story' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
              onClick={() => setActiveTab('story')}
            >
              {t.ourStory || "Our Story"}
            </button>
            <button
              className={`flex-1 py-3 font-medium text-lg ${activeTab === 'team' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
              onClick={() => setActiveTab('team')}
            >
              {t.ourTeam || "Our Team"}
            </button>
            <button
              className={`flex-1 py-3 font-medium text-lg ${activeTab === 'mission' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
              onClick={() => setActiveTab('mission')}
            >
              {t.ourMission || "Our Mission"}
            </button>
          </div>

          {/* Content based on active tab */}
          <div className={`w-full max-w-4xl ${darkMode ? 'bg-slate-800' : 'bg-white/40'} backdrop-blur-md rounded-3xl shadow-2xl p-8 border ${darkMode ? 'border-slate-700' : 'border-white/50'}`}>
            
            {/* Our Story Tab */}
            {activeTab === 'story' && (
              <div className="space-y-8">
                <div className="prose max-w-none mb-10">
                  <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-green-800'}`}>
                    {t.chessJourney || "Our Chess Journey"}
                  </h2>
                  <p className="mb-4 text-lg">
                    {t.storyIntro || "BoardVerse was born from a deep passion for the royal game. What started as a small chess club in Milano has evolved into one of Italy's leading online chess platforms."}
                  </p>
                  <p className="mb-4 text-lg">
                    {t.storyBody || "Our founders, a group of chess enthusiasts ranging from amateur players to grandmasters, shared a common vision: to create an inclusive space where chess lovers of all levels could learn, play, and connect."}
                  </p>
                  <p className="text-lg">
                    {t.storyEnd || "Today, we're proud to host thousands of games daily, offer comprehensive learning resources, and organize tournaments that bring together players from around the world."}
                  </p>
                </div>

                <div>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-green-800'}`}>
                    {t.keyMilestones || "Key Milestones"}
                  </h3>
                  <div className="relative ml-4">
                    <div className={`absolute left-3 top-0 bottom-0 w-0.5 ${darkMode ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                    <div className="space-y-8">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="relative pl-10">
                          <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-green-500'} flex items-center justify-center`}>
                            <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-white'}`}></div>
                          </div>
                          <div className={`text-sm font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-green-600'}`}>{milestone.year}</div>
                          <h4 className="text-lg font-medium mb-1">{milestone.event}</h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{milestone.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Our Team Tab */}
            {activeTab === 'team' && (
              <div>
                <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-green-800'}`}>
                  {t.meetTheTeam || "Meet the Team Behind BoardVerse"}
                </h2>
                
                <p className="mb-8 text-lg">
                  {t.teamIntro || "Our dedicated team combines chess expertise with technical innovation to create the best possible experience for chess enthusiasts."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamMembers.map((member) => (
                    <div 
                      key={member.id}
                      className={`p-6 rounded-xl transition-all duration-300 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white/80'} flex flex-col items-center text-center`}
                    >
                      <div className="mb-4 w-24 h-24 overflow-hidden rounded-full border-4 border-white/20">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-blue-300' : 'text-green-600'} font-medium`}>{member.role}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{member.bio}</p>
                    </div>
                  ))}
                </div>

                <div className={`mt-10 p-6 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                  <h3 className="text-xl font-bold mb-3">{t.joinTeam || "Join Our Team"}</h3>
                  <p className="mb-4">
                    {t.careerText || "We're always looking for passionate chess players and talented professionals to join our growing team."}
                  </p>
                  <Link href="/careers" className={`inline-block px-6 py-2 rounded-full font-medium text-white transition-colors ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`}>
                    {t.viewPositions || "View Open Positions"}
                  </Link>
                </div>
              </div>
            )}

            {/* Our Mission Tab */}
            {activeTab === 'mission' && (
              <div className="space-y-8">
                <div className="mb-8">
                  <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-green-800'}`}>
                    {t.ourMission || "Our Mission"}
                  </h2>
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'} mb-6`}>
                    <p className="text-lg italic">
                      &quot;{t.missionStatement || "To democratize the world of chess by creating an inclusive platform where players of all levels can learn, play, and grow in their chess journey."}&quot;
                    </p>
                  </div>
                  <p className="mb-4 text-lg">
                    {t.missionIntro || "At BoardVerse, we believe that chess is more than just a game—it's a tool for developing critical thinking, patience, and strategic planning."}
                  </p>
                  <p className="text-lg">
                    {t.missionBody || "We're committed to making chess accessible to everyone, from beginners taking their first steps to advanced players seeking new challenges."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'} flex flex-col items-center text-center`}>
                    <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-500/20' : 'bg-green-100'}`}>
                      <svg className={`w-8 h-8 ${darkMode ? 'text-blue-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{t.education || "Education"}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t.educationDesc || "Providing top-quality learning resources for players at every level."}
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'} flex flex-col items-center text-center`}>
                    <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-500/20' : 'bg-green-100'}`}>
                      <svg className={`w-8 h-8 ${darkMode ? 'text-blue-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{t.community || "Community"}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t.communityDesc || "Building connections between chess players worldwide."}
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'} flex flex-col items-center text-center`}>
                    <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-500/20' : 'bg-green-100'}`}>
                      <svg className={`w-8 h-8 ${darkMode ? 'text-blue-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{t.innovation || "Innovation"}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {t.innovationDesc || "Developing cutting-edge tools and features to enhance the chess experience."}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-green-800'}`}>
                    {t.ourValues || "Our Values"}
                  </h3>
                  <ul className={`list-disc pl-6 space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li className="text-lg"><span className="font-bold">{t.excellence || "Excellence"}</span> - {t.excellenceDesc || "Striving for the highest quality in all our offerings."}</li>
                    <li className="text-lg"><span className="font-bold">{t.inclusivity || "Inclusivity"}</span> - {t.inclusivityDesc || "Welcoming players of all backgrounds and skill levels."}</li>
                    <li className="text-lg"><span className="font-bold">{t.innovation || "Innovation"}</span> - {t.innovationValDesc || "Continuously improving our platform with the latest technology."}</li>
                    <li className="text-lg"><span className="font-bold">{t.sportsmanship || "Sportsmanship"}</span> - {t.sportsmanshipDesc || "Promoting fair play and respect within our community."}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Call to action */}
          <div className={`w-full max-w-4xl mt-10 p-8 rounded-3xl ${darkMode ? 'bg-slate-800/80' : 'bg-white/40'} backdrop-blur-md border ${darkMode ? 'border-slate-700' : 'border-white/50'} text-center`}>
            <h2 className="text-2xl font-bold mb-4">{t.joinCommunity || "Join Our Chess Community Today"}</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              {t.joinText || "Whether you're just learning the rules or you're an experienced player looking for new challenges, there's a place for you at BoardVerse."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/register" 
                className={`px-8 py-3 rounded-full font-bold text-white transition-all duration-500 ease-in-out transform ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} hover:-translate-y-1 active:translate-y-0`}
              >
                {t.signUp || "Sign Up Free"}
              </Link>
              <Link 
                href="/learn" 
                className={`px-8 py-3 rounded-full font-bold transition-all duration-500 ease-in-out transform ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-green-50 text-green-800'} hover:-translate-y-1 active:translate-y-0`}
              >
                {t.exploreResources || "Explore Resources"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;