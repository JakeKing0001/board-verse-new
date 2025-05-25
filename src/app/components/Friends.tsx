"use client";

import NavBar from "./NavBar";
import { useState } from "react";
import { usePieceContext } from "./PieceContext";
import toast from "react-hot-toast";
import { setRequests } from "../../../services/friends";
import { deleteRequests } from "../../../services/friends";
import { setFriends } from "../../../services/friends";
import { deleteFriends } from "../../../services/friends";

const FriendsPage = () => {
  const { isLoggedIn, allUsers, user, t, darkMode, friends, setFriends_, requests, setRequests_ } = usePieceContext();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: number; username: string; email: string; avatar: string }[]>([]);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error(t.enterValidUsername || "Please enter a valid username");
      return;
    }

    // Remove the loggedInUser from search results
    const resultsAll = allUsers.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()));
    const results = resultsAll.filter(u => user ? u.id !== user.id : true);
    if (results.length === 0) {
      toast.error(t.noUsersFound || "No users found");
    } else {
      toast.success(`${results.length} ${t.usersFound || "users found"}`);
    }

    setSearchResults(results);
  };

  // Friend request functionality
  const sendFriendRequest = async (userId: number) => {
    if (!isLoggedIn) {
      toast.error(t.loginRequired || "You must be logged in to send friend requests");
      return;
    }

    const requestedUser = searchResults.find(user => user.id === userId);
    if (requestedUser) {
      toast.success(`${t.friendRequestSent || "Friend request sent to"} ${requestedUser.username}`);
    } else {
      toast.error(t.userNotFound || "User not found");
    }

    setRequests({
      senderID: user ? user.id : 0,
      receiverID: userId
    })

    // In a real app, this would send the request to the backend
    // For now, we'll just clear the search results
    setSearchResults([]);
    setSearchQuery('');
    setShowModal(false);
  };

  // Accept friend request
  const acceptFriendRequest = async (userId: number) => {
    // Trova la richiesta di amicizia con l'id fornito
    const userRequest = requests.find(req => req.id === userId);

    // Se vuoi ottenere l'ID dell'utente che ha inviato la richiesta (friendID)
    // supponendo che la struttura sia { id, sender_id, receiver_id, ... }
    const friendID = userRequest ? userRequest.sender_id : undefined;
    console.log("Friend ID:", friendID);

    if (user && userRequest) {
      try {
        // Add to friends in backend
        await setFriends({
          userID: user.id,
          friendID: friendID
        });

        // Delete request
        console.log(userRequest.id)
        if (userRequest && userRequest.id) {
          await deleteRequests({ id: userRequest.id });
        }

        // Update UI
        setFriends_([
          ...friends,
          {
            id: userRequest.id,
            username: userRequest.username,
            email: userRequest.email,
            avatar: userRequest.avatar,
            status: 'online',
            lastSeen: 'Now'
          }
        ]);
        setRequests_(requests.filter(req => req.id !== userId));
        toast.success(`${t.friendRequestAccepted || "Friend request accepted from"} ${userRequest.username}`);
      } catch (error) {
        toast.error(t.errorAcceptingRequest || "Error accepting friend request");
        console.error(error);
      }
    } else {
      console.error("User or userRequest is undefined");
    }
  };

  // Decline friend request
  const declineFriendRequest = async (requesterId: number) => {
    const userDeclined = requests.find(req => req.id === requesterId);

    if (userDeclined) {
      try {
        // L'ID che dobbiamo inviare al backend è l'ID della richiesta stessa
        // In 'requests', il campo 'id' è già l'ID della richiesta di amicizia nel database
        await deleteRequests({ id: requesterId });

        // Aggiorna l'UI solo dopo la chiamata al backend riuscita
        setRequests_(requests.filter(req => req.id !== requesterId));
        toast.success(`${t.friendRequestDeclined || "Friend request declined from"} ${userDeclined?.username || "Unknown User"}`);
      } catch (error) {
        console.error('Error deleting friend request:', error);
        toast.error(t.errorDecliningRequest || "Error declining friend request");
      }
    } else {
      console.error('Friend request not found');
      toast.error(t.requestNotFound || "Request not found");
    }
  };

  // Remove friend
  const removeFriend = async (userId: number) => {
    const friendToRemove = friends.find(friend => friend.id === userId);

    if (friendToRemove && user) {
      try {
          await deleteFriends({ user_id: user.id, friend_id: userId });
          setFriends_(friends.filter(friend => friend.id !== userId));
          toast.success(`${friendToRemove.username} ${t.removedFromFriends || "removed from friends"}`);
      } catch (error) {
        toast.error(t.errorRemovingFriend || "Error removing friend");
        console.error(error);
      }
    } else {
      console.error("Friend to remove not found or user is undefined");
    }
  };

  // Handle add friend button click
  const handleAddFriend = () => {
    if (!isLoggedIn) {
      toast.error(t.loginRequired || "You must be logged in to add friends");
      return;
    }
    setShowModal(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Get status color based on online status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'offline': return darkMode ? 'text-gray-400' : 'text-gray-500';
      default: return '';
    }
  };

  return (
    <>
      <div className={`fixed top-0 left-0 w-full ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md z-50`}>
        <NavBar current={3} />
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
        <div className="z-10 w-full max-w-5xl px-4 flex flex-col items-center">
          <h1 className="text-5xl font-bold mb-8 tracking-tight">
            {t.friends || "Friends"}
          </h1>

          {/* Add friend button */}
          <div className="mb-8">
            <button
              onClick={handleAddFriend}
              className={`group relative inline-flex items-center justify-center px-8 py-4 text-xl font-bold text-white transition-all duration-500 ease-in-out transform ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0`}
            >
              <span className="relative flex items-center">
                <span>{t.addFriend || "Add Friend"}</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </span>
            </button>
          </div>

          {/* Tabs */}
          <div className="w-full max-w-4xl mb-6 flex border-b">
            <button
              className={`flex-1 py-3 font-medium text-lg ${activeTab === 'friends' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              {t.friends || "Friends"} ({friends.length})
            </button>
            <button
              className={`flex-1 py-3 font-medium text-lg ${activeTab === 'requests' ? `border-b-2 ${darkMode ? 'border-blue-500' : 'border-green-500'}` : ''} relative`}
              onClick={() => setActiveTab('requests')}
            >
              {t.requests || "Requests"} ({requests.length})
              {requests.length > 0 && (
                <span className={`absolute top-2 right-1/4 w-2 h-2 rounded-full ${darkMode ? 'bg-red-500' : 'bg-red-500'}`}></span>
              )}
            </button>
          </div>

          {/* Friends list or requests based on active tab */}
          <div className={`w-full max-w-4xl ${darkMode ? 'bg-slate-800' : 'bg-white/40'} backdrop-blur-md rounded-3xl shadow-2xl p-8 border ${darkMode ? 'border-slate-700' : 'border-white/50'}`}>
            {activeTab === 'friends' ? (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  {t.myFriends || "My Friends"}
                </h2>

                {friends.length === 0 ? (
                  <div className={`p-8 text-center rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                    <p className="text-lg opacity-70">{t.noFriendsYet || "No friends yet. Add some friends to play with!"}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className={`p-4 rounded-xl transition-all duration-300 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white/80'} flex items-center justify-between`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={friend.avatar}
                              alt={friend.username}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                            />
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}
                            ></span>
                          </div>
                          <div>
                            <h3 className="font-bold">{friend.username}</h3>
                            <div className="flex items-center text-sm">
                              <span className={getStatusColor(friend.status)}>
                                {friend.status === 'online' ? (t.online || "Online") : (t.lastSeen || "Last seen") + ": " + friend.lastSeen}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800'} transition-colors`}
                          >
                            {t.invite || "Invite"}
                          </button>
                          <button
                            onClick={() => removeFriend(friend.id)}
                            className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-slate-600 hover:bg-red-500 text-white' : 'bg-gray-100 hover:bg-red-100 text-gray-800 hover:text-red-800'} transition-colors`}
                          >
                            {t.remove || "Remove"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  {t.friendRequests || "Friend Requests"}
                </h2>

                {requests.length === 0 ? (
                  <div className={`p-8 text-center rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}>
                    <p className="text-lg opacity-70">{t.noRequests || "No pending friend requests"}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 rounded-xl transition-all duration-300 ${darkMode ? 'bg-slate-700' : 'bg-white/60'} flex items-center justify-between`}
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={request.avatar}
                            alt={request.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                          />
                          <div>
                            <h3 className="font-bold">{request.username}</h3>
                            <div className="text-sm opacity-70">
                              {t.requestedFriendship || "Requested"}: {request.requestDate}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} transition-colors`}
                          >
                            {t.accept || "Accept"}
                          </button>
                          <button
                            onClick={() => declineFriendRequest(request.id)}
                            className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-500 hover:bg-red-400 text-white'} transition-colors`}
                          >
                            {t.decline || "Decline"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`relative max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-green-800'}`}>
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 p-1 rounded-full ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <h3 className="text-2xl font-bold mb-6">{t.findFriends || "Find Friends"}</h3>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium">{t.searchByUsername || "Search by username"}:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.enterUsername || "Enter username..."}
                    className={`flex-grow px-4 py-3 rounded-lg focus:outline-none ${darkMode ? 'bg-slate-700 focus:ring-1 focus:ring-blue-500' : 'bg-green-50 focus:ring-1 focus:ring-green-500'}`}
                  />
                  <button
                    onClick={handleSearch}
                    className={`px-4 py-2 rounded-lg font-medium text-white ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'} transition-colors`}
                  >
                    {t.search || "Search"}
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">{t.searchResults || "Search Results"}:</h4>
                  <div className={`space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar`}>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className={`p-3 rounded-lg flex items-center justify-between ${darkMode ? 'bg-slate-700' : 'bg-green-50'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={result.avatar}
                            alt={result.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="font-medium">{result.username}</span>
                        </div>
                        <button
                          onClick={() => sendFriendRequest(result.id)}
                          className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} transition-colors`}
                        >
                          {t.addFriend || "Add Friend"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className={`px-6 py-2 rounded-full font-medium ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-green-800 hover:bg-green-50'}`}
              >
                {t.close || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FriendsPage;