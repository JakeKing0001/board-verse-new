"use client";

import NavBar from "./NavBar";
import { useState } from "react";
import { usePieceContext } from "./PieceContext";
import toast from "react-hot-toast";
import { setRequests } from "../../../services/friends";
import { deleteRequests } from "../../../services/friends";
import { setFriends } from "../../../services/friends";
import { deleteFriends } from "../../../services/friends";
import { createConversation } from "../../../services/messages";
import { debugLog } from '../../../lib/debug';

/**
 * FriendsPage component provides a user interface for managing friends and friend requests.
 *
 * Features:
 * - Displays a list of current friends with options to invite or remove them.
 * - Shows incoming friend requests with options to accept or decline.
 * - Allows searching for users by username and sending friend requests.
 * - Supports dark and light themes.
 * - Utilizes context for user, friends, requests, and localization.
 * - Includes animated background and responsive design.
 *
 * State:
 * - `showModal`: Controls visibility of the "Add Friend" modal.
 * - `searchQuery`: Stores the current search input for finding users.
 * - `searchResults`: Holds the results of the user search.
 * - `activeTab`: Determines whether the "Friends" or "Requests" tab is active.
 *
 * Context:
 * - Uses `usePieceContext` for authentication, user data, friends, requests, and translations.
 *
 * Methods:
 * - `handleSearch`: Searches users by username and updates search results.
 * - `sendFriendRequest`: Sends a friend request to a selected user.
 * - `acceptFriendRequest`: Accepts an incoming friend request and updates friends list.
 * - `declineFriendRequest`: Declines an incoming friend request.
 * - `removeFriend`: Removes a user from the friends list.
 * - `handleAddFriend`: Opens the "Add Friend" modal.
 * - `getStatusColor`: Returns a color class based on a friend's online status.
 *
 * UI:
 * - Renders a navigation bar, animated background, and main content area.
 * - Provides tabs for switching between friends and requests.
 * - Displays modals for adding friends and searching users.
 *
 * @component
 */
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
    const results = allUsers
      .filter((candidate) =>
        candidate.username?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((candidate) => user ? candidate.id !== user.id : true)
      .map((candidate) => ({
        id: candidate.id,
        username: candidate.username ?? `Utente ${candidate.id}`,
        email: candidate.email ?? '',
        avatar: candidate.avatar ?? '/default_avatar.png',
      }));
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
    const friendID = userRequest?.sender_id;
    debugLog('Friend ID:', friendID);

    if (user && userRequest && friendID) {
      try {
        // Add to friends in backend
        await setFriends({
          userID: user.id,
          friendID: friendID
        });

        // Initialize an empty conversation between the new friends
        if (friendID) {
          await createConversation({ friendID });
        }

        // Delete request
        debugLog(userRequest.id);
        if (userRequest && userRequest.id) {
          await deleteRequests({ id: userRequest.id });
        }

        // Update UI
        setFriends_([
          ...friends,
          {
            id: userRequest.id,
            user_id: user.id,
            friend_id: friendID,
            username: userRequest.username ?? `Utente ${friendID}`,
            email: userRequest.email ?? '',
            avatar: userRequest.avatar ?? '/default_avatar.png',
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
          const otherUserId = friendToRemove.user_id === user.id
            ? friendToRemove.friend_id
            : friendToRemove.user_id;
          await deleteFriends({ user_id: user.id, friend_id: otherUserId });
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
    <div className="bv-page">
      <div className="bv-nav-slot">
        <NavBar current={3} />
      </div>

      <main className="bv-page-with-nav relative flex min-h-screen flex-col items-center overflow-y-auto pb-14 text-[var(--bv-text)]">

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-80 h-80 ${darkMode ? 'bg-slate-700' : 'bg-green-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse`}></div>
          <div className={`absolute top-1/3 right-1/3 w-96 h-96 ${darkMode ? 'bg-slate-600' : 'bg-amber-200'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700`}></div>
          <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 ${darkMode ? 'bg-slate-800' : 'bg-green-300'} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000`}></div>
          <div className={`absolute bottom-1/3 right-1/4 w-64 h-64 ${darkMode ? 'bg-slate-700' : 'bg-amber-100'} rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-500`}></div>
        </div>

        {/* Main content */}
        <div className="z-10 flex w-full max-w-5xl flex-col items-center px-4 py-10 sm:py-14">
          <h1 className="mb-8 text-center text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            {t.friends || "Friends"}
          </h1>

          {/* Add friend button */}
          <div className="mb-8">
            <button
              onClick={handleAddFriend}
              className="bv-button-primary group px-8 text-base sm:text-lg"
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
          <div className="bv-tabs mb-6 w-full max-w-4xl">
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
          <div className={`bv-glass bv-liquid w-full max-w-4xl rounded-3xl border p-5 shadow-2xl sm:p-8 ${darkMode ? 'border-slate-700' : 'border-white/50'}`}>
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
                        className={`bv-glass-soft flex flex-col gap-4 rounded-2xl p-4 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/60 hover:bg-white/80'}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={friend.avatar || '/default_avatar.png'}
                              alt={friend.username || 'Amico'}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                            />
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}
                            ></span>
                          </div>
                          <div>
                            <h3 className="font-bold">{friend.username}</h3>
                            <div className="flex items-center text-sm">
                              <span className={getStatusColor(friend.status || 'offline')}>
                                {friend.status === 'online' ? (t.online || "Online") : (t.lastSeen || "Last seen") + ": " + friend.lastSeen}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
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
                        className={`bv-glass-soft flex flex-col gap-4 rounded-2xl p-4 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between ${darkMode ? 'bg-slate-700' : 'bg-white/60'}`}
                      >
                        <div className="flex items-center space-x-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={request.avatar || '/default_avatar.png'}
                            alt={request.username || 'Richiesta di amicizia'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                          />
                          <div>
                            <h3 className="font-bold">{request.username}</h3>
                            <div className="text-sm opacity-70">
                              {t.requestedFriendship || "Requested"}: {request.requestDate}
                            </div>
                          </div>
                        </div>

                        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
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
      </main>

      {/* Add Friend Modal */}
      {showModal && (
        <div className="bv-modal-backdrop fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="bv-glass-strong bv-liquid bv-form relative mx-4 w-full max-w-md rounded-3xl p-6 text-[var(--bv-text)] shadow-2xl">
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
    </div>
  );
};

export default FriendsPage;
