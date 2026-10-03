import { useEffect, useRef, useState } from "react";
import { Bot, MessageSquareText, X } from "lucide-react";
import "./PilotChatWidget.css";

function PilotChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatHeight, setChatHeight] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(420);
  const chatBodyRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi, I’m Pilot. I can help with scheduling, captions, and publishing ideas.",
    },
  ]);

  const getBotReply = (message) => {
    const text = message.toLowerCase();

    if (text.includes("schedule") || text.includes("post") || text.includes("publish")) {
      return "I can help you schedule the post at the best time and keep the caption aligned with each platform.";
    }

    if (text.includes("caption") || text.includes("headline") || text.includes("content")) {
      return "I’d tighten the headline, keep the CTA clear, and make the message platform-specific for stronger engagement.";
    }

    if (text.includes("image") || text.includes("visual") || text.includes("media")) {
      return "I can suggest a cleaner media-first layout and a caption that complements the image without feeling crowded.";
    }

    if (text.includes("hello") || text.includes("hi")) {
      return "Hello! I’m Pilot. What would you like help with today?";
    }

    return "I can help refine the schedule, messaging, and posting strategy for your content.";
  };

  const handleSend = () => {
    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    const userMessage = { sender: "user", text: trimmed };
    const botReply = { sender: "bot", text: getBotReply(trimmed) };

    setMessages((prev) => [...prev, userMessage, botReply]);
    setInput("");
  };

  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      const delta = startYRef.current - event.clientY;
      const nextHeight = Math.min(620, Math.max(260, startHeightRef.current + delta));
      setChatHeight(nextHeight);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing]);

  const startResize = (event) => {
    event.preventDefault();
    startYRef.current = event.clientY;
    startHeightRef.current = chatHeight;
    setIsResizing(true);
  };

  useEffect(() => {
    const chatBody = chatBodyRef.current;

    if (!chatBody) {
      return;
    }

    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <>
      {!open && (
        <button
          type="button"
          className="pilot-chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open Pilot chat"
          title="Pilot"
        >
          <Bot size={18} />
        </button>
      )}

      {open && (
        <div className="pilot-chat-widget" style={{ height: chatHeight }}>
          <div
            className="pilot-resize-handle"
            onMouseDown={startResize}
            aria-label="Resize chat vertically"
            title="Resize chat"
          />
          <div className="pilot-chat-header">
            <div className="pilot-chat-title">
              <span className="pilot-chat-badge">
                <Bot size={14} />
              </span>
              <div>
                <strong>Pilot</strong>
                <span className="font-mono">Live</span>
              </div>
            </div>

            <div className="pilot-chat-actions">
              <button
                type="button"
                className="pilot-tool-btn"
                aria-label="Close chat"
                onClick={() => {
                  setOpen(false);
                  setInput("");
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <>
            <div className="pilot-chat-body" ref={chatBodyRef}>
                {messages.map((message, index) => (
                  <div
                    key={`${message.sender}-${index}`}
                    className={`pilot-chat-bubble ${message.sender === "user" ? "pilot-user-bubble" : "pilot-bot-bubble"}`}
                  >
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="pilot-chat-input-row">
                <span className="pilot-input-icon" aria-hidden="true">
                  <MessageSquareText size={14} />
                </span>
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSend();
                    }
                  }}
                  placeholder="Ask Pilot..."
                />
                <button type="button" className="pilot-send-btn" onClick={handleSend}>
                  Send
                </button>
              </div>
            </>
        </div>
      )}
    </>
  );
}

export default PilotChatWidget;
