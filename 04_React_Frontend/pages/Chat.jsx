import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Sparkles,
  Building2,
  User,
  Clock,
  Briefcase,
  ArrowLeft,
  CheckCheck,
  Check,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Smile,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';

  const [conversations, setConversations] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(matchId || null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileList, setShowMobileList] = useState(!matchId);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all mutual match conversations
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const res = await api.get('/chat/conversations');
      const list = res.data || [];
      setConversations(list);

      // If no matchId was selected and we have conversations, select the first one on desktop
      if (!selectedMatchId && list.length > 0 && window.innerWidth >= 768) {
        setSelectedMatchId(list[0].matchId);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      if (!silent) setLoadingList(false);
    }
  };

  // Fetch messages for currently selected match
  const fetchMessages = async (mId, silent = false) => {
    if (!mId) return;
    if (!silent) setLoadingChat(true);
    try {
      const res = await api.get(`/chat/${mId}`);
      setActiveChat(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      if (!silent) setLoadingChat(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Update selected match when URL param changes
  useEffect(() => {
    if (matchId) {
      setSelectedMatchId(matchId);
      setShowMobileList(false);
    }
  }, [matchId]);

  // When selectedMatchId changes, load messages and update URL
  useEffect(() => {
    if (selectedMatchId) {
      fetchMessages(selectedMatchId);
    } else {
      setActiveChat(null);
      setMessages([]);
    }
  }, [selectedMatchId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedMatchId) {
        fetchMessages(selectedMatchId, true);
      }
      fetchConversations(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedMatchId]);

  // Send message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    if (!content || !selectedMatchId || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/chat/${selectedMatchId}`, { content });
      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      // Refresh list to update snippet
      fetchConversations(true);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Quick suggestion chips
  const candidateQuickReplies = [
    "Hi! Thank you for accepting the match. I'd love to connect regarding this role.",
    "When would be a good time for a brief discussion?",
    "I'm very excited about this opportunity. Let me know the next steps!",
  ];

  const employerQuickReplies = [
    "Hello! We were impressed by your profile and would like to schedule an introductory call.",
    "Are you available for a 20-minute chat this week?",
    "Could you let us know your current availability and notice period?",
  ];

  const quickReplies = isCandidate ? candidateQuickReplies : employerQuickReplies;

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const nameMatch = c.otherParty?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const jobMatch = c.job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || jobMatch;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-8 sm:pt-10 pb-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] min-h-[600px] flex flex-col">
        {/* Page Top Title / Back */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/matches"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Back to Matches"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-indigo-400" />
                  <span>Hiring Channels</span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Mutual Matches Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-end direct communication unlocked upon mutual match acceptance.
              </p>
            </div>
          </div>
        </div>

        {/* Main Chat Container */}
        <div className="flex-1 bg-[#090d1f]/90 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row">
          {/* Left Panel: Conversation List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col bg-[#060919] ${
              !showMobileList && selectedMatchId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Header */}
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Connections ({conversations.length})
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search matches or jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {loadingList ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">No active chats yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Chat opens automatically once both you and the candidate/employer accept a match.
                  </p>
                  <Link
                    to="/matches"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                  >
                    <span>Go to Smart Matches</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.matchId === selectedMatchId;
                  return (
                    <button
                      key={conv.matchId}
                      onClick={() => {
                        setSelectedMatchId(conv.matchId);
                        setShowMobileList(false);
                        navigate(`/chat/${conv.matchId}`);
                      }}
                      className={`w-full p-4 text-left transition-all flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/20">
                          {conv.otherParty?.avatar || 'SM'}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#060919]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-semibold text-white truncate capitalize">
                            {conv.otherParty?.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {conv.lastMessage?.created_at
                              ? new Date(conv.lastMessage.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'New'}
                          </span>
                        </div>

                        {/* Job Position Pill */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[11px] text-indigo-300 truncate font-medium">
                            {conv.job?.title}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                            {conv.matchScore}%
                          </span>
                        </div>

                        {/* Last message preview */}
                        <p className="text-xs text-slate-400 truncate pt-1">
                          {conv.lastMessage ? (
                            <span>
                              {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}
                              {conv.lastMessage.content}
                            </span>
                          ) : (
                            <span className="italic text-slate-500">Mutual match accepted. Start the conversation!</span>
                          )}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 self-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat View */}
          <div
            className={`flex-1 flex flex-col bg-[#040714] ${
              showMobileList && !selectedMatchId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeChat ? (
              <>
                {/* Chat Top Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#060919]/80 backdrop-blur-md">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setShowMobileList(true)}
                      className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                        {activeChat.otherParty?.avatar || 'SM'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#040714]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white truncate capitalize">
                          {activeChat.otherParty?.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {activeChat.otherParty?.role === 'company' ? 'Employer' : 'Candidate'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-indigo-400" />
                        <span>Matched for: <strong className="text-slate-200">{activeChat.job?.title}</strong></span>
                        <span className="text-indigo-400">({activeChat.matchScore}% Compatibility)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeChat.job?.id && (
                      <Link
                        to={`/jobs/${activeChat.job.id}`}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                      >
                        <span>View Job Spec</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Mutual Acceptance Banner */}
                <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-slate-900/60 border-b border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Mutual Match Established:</strong> Both parties have accepted. You can schedule interviews and discuss terms directly.
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
                    Two-Way Encrypted
                  </span>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                  {loadingChat ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-2/3 h-14 rounded-2xl animate-pulse ${
                            i % 2 === 0
                              ? 'ml-auto bg-indigo-600/20'
                              : 'mr-auto bg-white/5'
                          }`}
                        />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-white">Start the Conversation</h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        You both agreed this position was a strong fit. Break the ice using one of the quick suggestions below or write your own message!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <motion.div
                          key={msg.id || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                            {!isMe && (
                              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {activeChat.otherParty?.avatar || 'U'}
                              </div>
                            )}

                            <div
                              className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg ${
                                isMe
                                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-indigo-600/20'
                                  : 'bg-[#131b2e] border border-white/10 text-slate-200 rounded-bl-none'
                              }`}
                            >
                              {!isMe && (
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">
                                  {msg.senderName}
                                </p>
                              )}
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <div
                                className={`flex items-center justify-end gap-1 text-[10px] pt-1 ${
                                  isMe ? 'text-indigo-200/80' : 'text-slate-500'
                                }`}
                              >
                                <span>
                                  {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {isMe && (
                                  <span>
                                    {msg.read ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-emerald-300 inline" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-indigo-200 inline" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="px-4 py-2 border-t border-white/5 bg-[#060919]/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Quick Prompts:
                  </span>
                  {quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => setInputText(reply)}
                      className="px-3 py-1 rounded-full bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap flex-shrink-0"
                    >
                      {reply.length > 40 ? `${reply.slice(0, 40)}...` : reply}
                    </button>
                  ))}
                </div>

                {/* Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-white/10 bg-[#060919] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activeChat.otherParty?.name || 'them'}...`}
                    className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center"
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              /* No chat selected */
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Select a Hiring Channel</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                    Choose one of your mutual matches from the left list to begin messaging, coordinate interview times, and discuss candidate compensation directly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
