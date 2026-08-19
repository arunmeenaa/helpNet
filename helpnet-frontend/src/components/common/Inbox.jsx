import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Mail, MessageCircle, Send, UserRound } from "lucide-react";
import {
  getConversation,
  getInbox,
  markMessageAsRead,
  sendMessage,
} from "../../services/messageService";
import socket from "../../socket";

const getItems = (response) => {
  if (Array.isArray(response)) return response;
  const items =
    response?.messages ||
    response?.inbox ||
    response?.conversations ||
    response?.data;

  return Array.isArray(items) ? items : [];
};

const getId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value._id || value.id || value.userId || null;
};

const sameId = (first, second) =>
  first != null && second != null && String(first) === String(second);

const getSenderId = (message) =>
  getId(message?.sender) ||
  message?.senderId ||
  message?.fromUserId ||
  message?.from;

const getReceiverId = (message) =>
  getId(message?.receiver || message?.recipient) ||
  message?.receiverId ||
  message?.recipientId ||
  message?.toUserId;

const isMessageRead = (message) =>
  message?.read ?? message?.isRead ?? Boolean(message?.readAt);

const getPostType = (message) => {
  const value = message?.postType || message?.type;

  if (value === "offer") return "offer";
  if (value === "request") return "request";

  return null;
};

const getPostId = (message) =>
  message?.relatedPostId ||
  message?.postId ||
  message?.post?._id ||
  message?.requestId ||
  message?.offerId ||
  null;

const getPersonName = (person) =>
  person?.fullName || person?.name || person?.email || "Resident";

const getMessageText = (message) =>
  message?.content || message?.text || message?.message || "";

const getThreadKey = (message, userId) => {
  const senderId = getSenderId(message);
  const receiverId = getReceiverId(message);
  const otherUserId = sameId(senderId, userId)
    ? receiverId
    : senderId || receiverId;

  return [
    otherUserId || message?.userId || "unknown-user",
    getPostType(message),
    getPostId(message) || "unknown-post",
  ].join(":");
};

const normalizeThread = (message, userId) => {
  const senderId = getSenderId(message);
  const receiver = message?.receiver || message?.recipient;
  const receiverId = getReceiverId(message);
  const otherUser = sameId(senderId, userId)
    ? receiver
    : message?.sender || message?.user || message?.resident;

  return {
    id: getThreadKey(message, userId),
    userId:
      (sameId(senderId, userId) ? receiverId : senderId) ||
      message?.userId ||
      message?.otherUserId,
    user: otherUser,
    postId: getPostId(message),
    postType: getPostType(message),
    postTitle:
      message?.post?.title ||
      message?.postTitle ||
      (getPostType(message) === "offer" ? "Help offer" : "Help request"),
    lastMessage: getMessageText(message),
    lastMessageAt: message?.createdAt || message?.updatedAt || null,
    unreadCount: !isMessageRead(message) && !sameId(senderId, userId) ? 1 : 0,
  };
};

export default function Inbox() {
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    [],
  );
  const currentUserId = getId(storedUser);

  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const activeThreadRef = useRef(activeThread);

  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInbox = useCallback(async () => {
    try {
      setError("");
      const response = await getInbox();
      const inboxMessages = getItems(response);
      const grouped = new Map();

      inboxMessages.forEach((message) => {
        const thread = normalizeThread(message, currentUserId);
        if (!thread.userId || !thread.postId) return;

        const previous = grouped.get(thread.id);
        if (!previous) {
          grouped.set(thread.id, thread);
          return;
        }

        const previousTime = new Date(previous.lastMessageAt || 0).getTime();
        const currentTime = new Date(thread.lastMessageAt || 0).getTime();

        grouped.set(thread.id, {
          ...(currentTime >= previousTime ? thread : previous),
          unreadCount: previous.unreadCount + thread.unreadCount,
        });
      });

      setThreads(
        [...grouped.values()].sort(
          (a, b) =>
            new Date(b.lastMessageAt || 0).getTime() -
            new Date(a.lastMessageAt || 0).getTime(),
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to load your inbox.");
    } finally {
      setLoadingThreads(false);
    }
  }, [currentUserId]);

  const openThread = useCallback(
    async (thread, markAsRead = true) => {
      if (!thread?.userId || !thread.postId) return;

      setActiveThread(thread);
      setLoadingMessages(true);
      setError("");

      try {
        const response = await getConversation(
          thread.userId,
          thread.postType,
          thread.postId,
        );
        const conversation = getItems(response);
        setMessages(conversation);

        if (markAsRead) {
          const unreadMessages = conversation.filter(
            (msg) =>
              !isMessageRead(msg) && !sameId(getSenderId(msg), currentUserId),
          );

          if (unreadMessages.length > 0) {
            await Promise.all(
              unreadMessages.map((msg) => markMessageAsRead(msg._id || msg.id)),
            );
          }

          setThreads((previous) =>
            previous.map((item) =>
              item.id === thread.id ? { ...item, unreadCount: 0 } : item,
            ),
          );
        }
      } catch (err) {
        setError(err.message || "Unable to load this conversation.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [currentUserId],
  );

  useEffect(() => {
    if (!currentUserId) return;

    const joinUserRoom = () => {
      socket.emit("join_room", currentUserId);
    };

    if (socket.connected) {
      joinUserRoom();
    }

    socket.on("connect", joinUserRoom);

    loadInbox();

    const handleIncomingMessage = (newMessage) => {
      loadInbox();

      const currentActive = activeThreadRef.current;
      if (!currentActive || !newMessage) return;

      const msgPostId = getPostId(newMessage);
      const msgSenderId = getSenderId(newMessage);
      const newMsgId = getId(newMessage);

      const isCurrentThread =
        sameId(msgPostId, currentActive.postId) &&
        (sameId(msgSenderId, currentActive.userId) ||
          sameId(msgSenderId, currentUserId));

      if (isCurrentThread) {
        setMessages((prev) => {
          // Strict deduplication check using normalized IDs
          const exists = prev.some((m) => sameId(getId(m), newMsgId));
          if (exists) return prev;
          return [...prev, newMessage];
        });

        if (!sameId(msgSenderId, currentUserId)) {
          markMessageAsRead(newMsgId).catch(() => {});
        }
      }
    };

    socket.on("receive_message", handleIncomingMessage);

    return () => {
      socket.off("connect", joinUserRoom);
      socket.off("receive_message", handleIncomingMessage);
    };
  }, [loadInbox, currentUserId]);

  const handleSend = async (event) => {
    event.preventDefault();
    const content = draft.trim();

    if (!content || !activeThread || sending) return;

    setSending(true);
    setError("");

    try {
      setDraft("");

      await sendMessage({
        receiverId: activeThread.userId,
        relatedPostId: activeThread.postId,
        postType: activeThread.postType,
        postTitle: activeThread.postTitle,
        content,
      });

      // DO NOT manually mutate setMessages here.
      // The Socket event 'receive_message' emitted from the backend controller
      // will trigger 'handleIncomingMessage' and update state once.
      loadInbox();
    } catch (err) {
      setError(err.message || "Unable to send message.");
      setDraft(content); // Restore draft on error
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-4 py-6 sm:px-6">
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-3xl border border-white/60 bg-white/45 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/45">
        <aside
          className={`w-full shrink-0 border-r border-white/50 dark:border-white/10 md:block md:w-96 ${
            activeThread ? "hidden" : "block"
          }`}
        >
          <div className="border-b border-white/50 px-5 py-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100/70 p-3 text-blue-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                <Mail size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  Inbox
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Requests and offers
                </p>
              </div>
            </div>
          </div>

          {error && (
            <p className="mx-5 mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="h-[calc(100%-6.5rem)] overflow-y-auto p-3">
            {loadingThreads ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-2xl bg-white/50 dark:bg-white/5"
                  />
                ))}
              </div>
            ) : threads.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-500 dark:text-slate-400">
                <MessageCircle size={38} className="mb-3 opacity-50" />
                <p className="font-semibold">No conversations yet</p>
                <p className="mt-1 text-sm">
                  Messages about your requests and offers will appear here.
                </p>
              </div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => openThread(thread)}
                  className={`mb-2 w-full rounded-2xl border p-4 text-left transition-all ${
                    activeThread?.id === thread.id
                      ? "border-blue-300 bg-blue-100/70 shadow-lg shadow-blue-500/10 dark:border-cyan-700 dark:bg-cyan-900/25"
                      : "border-transparent bg-white/35 hover:border-white/70 hover:bg-white/65 dark:bg-white/5 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${
                        thread.postType === "offer"
                          ? "from-green-500 to-emerald-600"
                          : "from-blue-600 to-cyan-500"
                      }`}
                    >
                      {getPersonName(thread.user).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-bold text-slate-900 dark:text-white">
                          {getPersonName(thread.user)}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide ${
                          thread.postType === "offer"
                            ? "text-green-600 dark:text-green-400"
                            : "text-blue-600 dark:text-cyan-400"
                        }`}
                      >
                        {thread.postType} · {thread.postTitle}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {thread.lastMessage || "No message content"}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section
          className={`min-w-0 flex-1 flex-col ${
            activeThread ? "flex" : "hidden md:flex"
          }`}
        >
          {activeThread ? (
            <>
              <header className="flex items-center gap-3 border-b border-white/50 px-5 py-4 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveThread(null)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white/60 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-cyan-400"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </button>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${
                    activeThread.postType === "offer"
                      ? "from-green-500 to-emerald-600"
                      : "from-blue-600 to-cyan-500"
                  }`}
                >
                  {getPersonName(activeThread.user).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-slate-900 dark:text-white">
                    {getPersonName(activeThread.user)}
                  </h2>
                  <p
                    className={`truncate text-xs font-semibold uppercase tracking-wide ${
                      activeThread.postType === "offer"
                        ? "text-green-600 dark:text-green-400"
                        : "text-blue-600 dark:text-cyan-400"
                    }`}
                  >
                    {activeThread.postType}: {activeThread.postTitle}
                  </p>
                </div>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No messages in this conversation yet.
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const isMine = sameId(
                        getSenderId(message),
                        currentUserId,
                      );
                      return (
                        <div
                          key={getId(message) || index}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                              isMine
                                ? "rounded-br-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                                : "rounded-bl-md border border-white/60 bg-white/65 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm">
                              {getMessageText(message)}
                            </p>
                            <time
                              className={`mt-1 block text-[10px] ${
                                isMine ? "text-white/70" : "text-slate-400"
                              }`}
                            >
                              {message.createdAt
                                ? new Date(message.createdAt).toLocaleString()
                                : ""}
                            </time>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="border-t border-white/50 p-4 dark:border-white/10"
              >
                <div className="flex items-end gap-3 rounded-2xl border border-white/60 bg-white/55 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    rows={1}
                    placeholder={`Message about this ${activeThread.postType}...`}
                    className="min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 p-3 text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-500 dark:text-slate-400">
              <div className="mb-4 rounded-3xl bg-blue-100/70 p-5 text-blue-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                <UserRound size={36} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Select a conversation
              </h2>
              <p className="mt-2 max-w-sm text-sm">
                Choose a request or offer from the inbox to view its chat.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}