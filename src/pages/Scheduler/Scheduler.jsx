import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock,
  Send,
  Sparkles,
  Layers,
  CheckCircle,
  FileText,
  Paperclip,
  X,
  Bold,
  Italic,
  AlignJustify,
  SmilePlus,
} from "lucide-react";
import { FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { getAccounts } from "../../services/socialService";
import { createPost, getPosts } from "../../services/postService";
import "./Scheduler.css";

const PLATFORM_KEYS = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter",
};

function Scheduler() {
  const location = useLocation();
  const draft = location.state?.draft;

  const [mediaItems, setMediaItems] = useState([]);
  const [caption, setCaption] = useState(draft?.caption || draft?.title || "");
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => {
    if (!draft?.social_account_id) {
      return ["linkedin"];
    }

    const platformMap = {
      1: "linkedin",
      2: "instagram",
      3: "facebook",
      4: "twitter",
      5: "linkedin",
    };

    return [platformMap[draft.social_account_id] || "linkedin"];
  });
  const [scheduledDate, setScheduledDate] = useState(
    draft?.scheduled_time ? new Date(draft.scheduled_time).toISOString().slice(0, 10) : ""
  );
  const [scheduledTime, setScheduledTime] = useState(
    draft?.scheduled_time ? new Date(draft.scheduled_time).toTimeString().slice(0, 5) : ""
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [queuedPosts, setQueuedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [instagramSlideIndex, setInstagramSlideIndex] = useState(0);
  const [justifyIndex, setJustifyIndex] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const captionEditorRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const justifyCommands = ["justifyLeft", "justifyCenter", "justifyRight", "justifyFull"];
  const justifyLabels = ["Left", "Center", "Right", "Justify"];
  const emojiOptions = ["😊", "😂", "🔥", "😍", "👍", "🎉", "👏", "💯", "❤️", "✨", "😎", "🙌", "🚀", "💬", "✅", "😄", "🤝", "📌", "🎯", "🌟"];

  useEffect(() => {
    if (!captionEditorRef.current) {
      return;
    }

    if (caption && captionEditorRef.current.innerHTML !== caption) {
      captionEditorRef.current.innerHTML = caption;
    }
  }, [caption]);

  useEffect(() => {
    if (!showEmojiPicker) {
      return;
    }

    const handlePointerDown = (event) => {
      const picker = emojiPickerRef.current;
      const trigger = document.getElementById("emoji-trigger-button");

      if (picker && !picker.contains(event.target) && (!trigger || !trigger.contains(event.target))) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [showEmojiPicker]);

  const insertEmojiAtCaret = (emoji) => {
    const editor = captionEditorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(emoji));
      range.collapse(false);
    } else {
      document.execCommand("insertText", false, emoji);
    }

    setCaption(editor.innerHTML);
  };

  const handleEditorPaste = (event) => {
    const pastedText = event.clipboardData.getData("text/plain") || "";
    event.preventDefault();

    const editor = captionEditorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    document.execCommand("insertText", false, pastedText);
    setCaption(editor.innerHTML);
  };

  const applyInlineFormat = (command) => {
    const editor = captionEditorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    if (command === "emoji") {
      setShowEmojiPicker((prev) => !prev);
      return;
    }

    if (command === "justify-cycle") {
      const nextIndex = (justifyIndex + 1) % justifyCommands.length;
      setJustifyIndex(nextIndex);
      document.execCommand(justifyCommands[nextIndex], false, null);
      setCaption(editor.innerHTML);
      return;
    }

    document.execCommand(command, false, null);
    setCaption(editor.innerHTML);
  };

  const loadData = async () => {
    try {
      setError("");
      const [accountData, postData] = await Promise.all([
        getAccounts(),
        getPosts(),
      ]);

      setAccounts(accountData.accounts || []);
      setQueuedPosts(
        (postData.posts || []).filter((post) =>
          ["SCHEDULED", "QUEUED", "DRAFT"].includes(post.status)
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setInstagramSlideIndex(0);
  }, [mediaItems.length]);

  const togglePlatform = (key) => {
    setSelectedPlatforms((prev) =>
      prev.includes(key) ? prev.filter((platform) => platform !== key) : [...prev, key]
    );
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const validFiles = [];
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError("Each attachment must be smaller than 5 MB.");
        return;
      }

      validFiles.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        kind: file.type.startsWith("image/") ? "image" : "document",
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      });
    });

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    setError("");
    setMediaItems((prev) => [...prev, ...validFiles]);
    event.target.value = "";
  };

  const removeMediaItem = (id) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getPlatformIcon = (platformName) => {
    switch (platformName?.toLowerCase()) {
      case "linkedin":
        return <FaLinkedin key="l" />;
      case "instagram":
        return <FaInstagram key="i" />;
      case "facebook":
        return <FaFacebook key="f" />;
      case "twitter":
        return <FaXTwitter key="x" />;
      default:
        return null;
    }
  };

  const findAccountForPlatform = (platformKey) => {
    const platformName = PLATFORM_KEYS[platformKey];

    return accounts.find(
      (account) => account.platform.toLowerCase() === platformName.toLowerCase()
    );
  };

  const getPlatformColor = (platformKey) => {
    const isDark = document.documentElement.dataset.theme === "dark";

    if (isDark) {
      switch (platformKey) {
        case "linkedin":
          return "#9a7658";
        case "instagram":
          return "#b7967d";
        case "facebook":
          return "#7f6858";
        case "twitter":
          return "#c6b099";
        default:
          return "#d9c8b5";
      }
    }

    switch (platformKey) {
      case "linkedin":
        return "#0a66c2";
      case "instagram":
        return "#d93f7d";
      case "facebook":
        return "#1877f2";
      case "twitter":
        return "#1d9bf0";
      default:
        return "#27251f";
    }
  };

  const getPlatformTint = (platformKey) => {
    const isDark = document.documentElement.dataset.theme === "dark";

    if (isDark) {
      switch (platformKey) {
        case "linkedin":
          return "rgba(154, 118, 88, 0.16)";
        case "instagram":
          return "rgba(183, 150, 125, 0.16)";
        case "facebook":
          return "rgba(127, 104, 88, 0.14)";
        case "twitter":
          return "rgba(198, 176, 153, 0.14)";
        default:
          return "rgba(217, 200, 181, 0.12)";
      }
    }

    switch (platformKey) {
      case "linkedin":
        return "rgba(10, 102, 194, 0.08)";
      case "instagram":
        return "rgba(217, 63, 125, 0.08)";
      case "facebook":
        return "rgba(24, 119, 242, 0.08)";
      case "twitter":
        return "rgba(29, 155, 240, 0.08)";
      default:
        return "rgba(39, 37, 31, 0.06)";
    }
  };

  const renderMediaPreviewBlock = (platformKey) => {
    if (!mediaItems.length) {
      return null;
    }

    const imageItems = mediaItems.filter((item) => item.kind === "image");
    const documentItems = mediaItems.filter((item) => item.kind === "document");

    if (platformKey === "instagram") {
      const instagramSlides = mediaItems.filter((item) => item.kind === "image").length
        ? mediaItems.filter((item) => item.kind === "image")
        : mediaItems.slice(0, 1);

      const currentSlide = instagramSlides[instagramSlideIndex] || instagramSlides[0];

      return (
        <div className="media-layout media-layout-instagram">
          <div className="instagram-carousel">
            {instagramSlides.length > 1 && (
              <>
                <button
                  type="button"
                  className="instagram-nav instagram-nav-left"
                  onClick={() => setInstagramSlideIndex((prev) => (prev === 0 ? instagramSlides.length - 1 : prev - 1))}
                  aria-label="Previous Instagram media"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="instagram-nav instagram-nav-right"
                  onClick={() => setInstagramSlideIndex((prev) => (prev === instagramSlides.length - 1 ? 0 : prev + 1))}
                  aria-label="Next Instagram media"
                >
                  ›
                </button>
              </>
            )}

            {currentSlide && currentSlide.kind === "image" ? (
              <div className="media-feature media-feature-image instagram-slide">
                <img src={currentSlide.previewUrl} alt={currentSlide.name} />
              </div>
            ) : (
              <div className="media-strip-item media-strip-doc instagram-slide">
                <FileText size={18} />
                <span>{currentSlide?.name || "Attachment"}</span>
              </div>
            )}
          </div>

          {instagramSlides.length > 1 && (
            <div className="instagram-dots">
              {instagramSlides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`instagram-dot ${instagramSlideIndex === index ? "is-active" : ""}`}
                  onClick={() => setInstagramSlideIndex(index)}
                  aria-label={`Show slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (platformKey === "facebook") {
      const firstImage = imageItems[0];
      return (
        <div className="media-layout media-layout-facebook">
          {firstImage ? (
            <div className="media-feature media-feature-image">
              <img src={firstImage.previewUrl} alt={firstImage.name} />
            </div>
          ) : null}

          {documentItems.length > 0 || imageItems.length > 1 ? (
            <div className="media-strip">
              {(imageItems.slice(1).length ? imageItems.slice(1) : documentItems).slice(0, 3).map((item) =>
                item.kind === "image" ? (
                  <div key={item.id} className="media-strip-item media-strip-image">
                    <img src={item.previewUrl} alt={item.name} />
                  </div>
                ) : (
                  <div key={item.id} className="media-strip-item media-strip-doc">
                    <FileText size={16} />
                    <span>{item.name}</span>
                  </div>
                )
              )}
            </div>
          ) : null}
        </div>
      );
    }

    if (platformKey === "twitter") {
      const firstImage = imageItems[0];
      return (
        <div className="media-layout media-layout-twitter">
          {firstImage ? (
            <div className="media-feature media-feature-image">
              <img src={firstImage.previewUrl} alt={firstImage.name} />
            </div>
          ) : null}

          {mediaItems.slice(1, 4).length > 0 ? (
            <div className="media-strip media-strip-compact">
              {mediaItems.slice(1, 4).map((item) =>
                item.kind === "image" ? (
                  <div key={item.id} className="media-strip-item media-strip-image">
                    <img src={item.previewUrl} alt={item.name} />
                  </div>
                ) : (
                  <div key={item.id} className="media-strip-item media-strip-doc">
                    <FileText size={16} />
                    <span>{item.name}</span>
                  </div>
                )
              )}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="media-layout media-layout-linkedin">
        {mediaItems.slice(0, 2).map((item, index) =>
          item.kind === "image" ? (
            <div key={item.id} className={`media-feature ${index === 0 ? "media-feature-image" : "media-feature-thumbnail"}`}>
              <img src={item.previewUrl} alt={item.name} />
            </div>
          ) : (
            <div key={item.id} className="media-strip-item media-strip-doc">
              <FileText size={16} />
              <span>{item.name}</span>
            </div>
          )
        )}
      </div>
    );
  };

  const renderPlatformPreview = (platformKey) => {
    const account = findAccountForPlatform(platformKey);
    const platformName = PLATFORM_KEYS[platformKey];

    const engagementConfig = {
      linkedin: ["Like", "Comment", "Repost", "Send"],
      instagram: ["❤ 128", "💬 24", "↻ 9"],
      facebook: ["Like", "Comment", "Share"],
      twitter: ["❤ 128", "💬 24", "🔁 9", "📤"],
    };

    const engagementItems = engagementConfig[platformKey] || ["❤ 128", "💬 24", "↻ 9"];

    return (
      <div
        key={platformKey}
        className="platform-preview-card"
        style={{
          "--platform-color": getPlatformColor(platformKey),
          "--platform-tint": getPlatformTint(platformKey),
        }}
      >
        <div className="social-preview-topbar">
          <div className="social-preview-brand">
            <span className="social-preview-icon">{getPlatformIcon(platformKey)}</span>
            <div>
              <p className="social-preview-platform">{platformName}</p>
              <span className="social-preview-account">
                {account ? account.username || account.name || "Connected account" : "Not connected"}
              </span>
            </div>
          </div>
          <span className="social-preview-badge font-mono">LIVE</span>
        </div>

        <div className={`social-preview-surface social-preview-${platformKey}`}>
          <div className="social-preview-header-row">
            <div className="social-preview-avatar">
              {platformName.slice(0, 1)}
            </div>
            <div className="social-preview-user-meta">
              <strong>{account ? account.name || "Brand Studio" : "Brand Studio"}</strong>
              <span>{platformName}</span>
            </div>
          </div>

          {renderMediaPreviewBlock(platformKey)}

          <p
            className="social-preview-caption"
            dangerouslySetInnerHTML={{
              __html: caption || "Your caption will appear here once you add your message.",
            }}
          />

          <div className={`social-preview-engagement-row social-preview-engagement-row-${platformKey} font-mono`}>
            {engagementItems.map((item) => (
              <span key={item} className="social-preview-engagement-item">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleQueuePost = async (event) => {
    event.preventDefault();

    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform.");
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      alert("Please choose a publish date and time.");
      return;
    }

    const scheduledDateTime = `${scheduledDate}T${scheduledTime}:00`;

    try {
      setSubmitting(true);
      setError("");

      for (const platformKey of selectedPlatforms) {
        const account = findAccountForPlatform(platformKey);

        if (!account) {
          throw new Error(
            `Connect your ${PLATFORM_KEYS[platformKey]} account before scheduling.`
          );
        }

        await createPost({
          social_account_id: account.id,
          caption,
          title: caption.slice(0, 80),
          scheduled_time: scheduledDateTime,
          image: mediaItems[0]?.file || null,
        });
      }

      await loadData();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="scheduler-page">
      <div className="page-header hairline-b">
        <div>
          <span className="eyebrow-text font-mono">CONTENT RHYTHM</span>
          <h1 className="page-title font-serif">Editorial Scheduler</h1>
          <p className="page-subtitle">
            Draft, attach media, and broadcast scheduled posts across all connected networks.
          </p>
        </div>

        <div className="header-meta font-mono">
          <span>ACTIVE QUEUE: {String(queuedPosts.length).padStart(2, "0")} POSTS</span>
        </div>
      </div>

      {showSuccess && (
        <div className="success-toast font-mono">
          <CheckCircle size={16} />
          <span>Post scheduled and appended to current queue successfully!</span>
        </div>
      )}

      {error && (
        <p style={{ color: "#dc2626", padding: "0 0 1rem 0" }}>{error}</p>
      )}

      <div className="scheduler-grid">
        <div className="composer-column hairline-r">
          <div className="column-title-row hairline-b">
            <Sparkles size={18} />
            <h2 className="column-heading font-serif">Compose New Broadcast</h2>
          </div>

          <form onSubmit={handleQueuePost} className="composer-form">
            <div className="form-section">
              <span className="form-label font-mono">SELECT TARGET PLATFORMS</span>
              <div className="platform-toggle-row">
                {["linkedin", "instagram", "facebook", "twitter"].map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    className={`plat-toggle-btn ${selectedPlatforms.includes(platform) ? "is-selected" : ""}`}
                    onClick={() => togglePlatform(platform)}
                  >
                    {getPlatformIcon(platform)}
                    <span>{PLATFORM_KEYS[platform]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <div className="caption-editor-header">
                <span className="form-label font-mono">CAPTION & EDITORIAL BODY</span>
                <div className="inline-format-toolbar">
                  <button
                    type="button"
                    className="inline-format-btn"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applyInlineFormat("bold")}
                  >
                    <Bold size={14} />
                    <span>Bold</span>
                  </button>
                  <button
                    type="button"
                    className="inline-format-btn"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applyInlineFormat("italic")}
                  >
                    <Italic size={14} />
                    <span>Emphasize</span>
                  </button>
                  <button
                    type="button"
                    className="inline-format-btn"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applyInlineFormat("justify-cycle")}
                  >
                    <AlignJustify size={14} />
                    <span>{justifyLabels[justifyIndex]}</span>
                  </button>
                  <button
                    id="emoji-trigger-button"
                    type="button"
                    className="inline-format-btn"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applyInlineFormat("emoji")}
                  >
                    <SmilePlus size={14} />
                    <span>Emoji</span>
                  </button>
                </div>
              </div>

              <div className="caption-editor-shell">
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="emoji-picker" role="dialog" aria-label="Emoji picker">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="emoji-option"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => insertEmojiAtCaret(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  ref={captionEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck
                  className="caption-editor hairline-b"
                  data-placeholder="Write your editorial caption here..."
                  onInput={(event) => setCaption(event.currentTarget.innerHTML)}
                  onPaste={handleEditorPaste}
                  style={{ direction: "ltr", textAlign: "left" }}
                />
              </div>
            </div>

            <div className="form-section">
              <span className="form-label font-mono">ATTACH MEDIA OR DOCUMENTS</span>
              <div className="document-attachment">
                <label htmlFor="document-upload" className="document-upload-label">
                  <Paperclip size={18} />
                  <span>Add files</span>
                </label>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,image/*"
                  multiple
                  onChange={handleFileChange}
                  className="document-upload-input"
                />

                <span className="document-helper-text">The order you select files is preserved in the preview and queue.</span>

                {mediaItems.length > 0 ? (
                  <div className="attached-media-stack">
                    {mediaItems.map((item, index) => (
                      <div key={item.id} className="attached-document-row">
                        {item.kind === "image" ? <Paperclip size={18} /> : <FileText size={18} />}
                        <span className="attached-document-name" title={item.name}>
                          {index + 1}. {item.name}
                        </span>
                        <span className="attached-document-size font-mono">
                          {(item.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          className="remove-document-button"
                          onClick={() => removeMediaItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="form-section timing-row hairline-t">
              <div className="time-field">
                <span className="form-label font-mono">PUBLISH DATE</span>
                <div className="inline-input-wrap">
                  <CalendarIcon size={16} />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(event) => setScheduledDate(event.target.value)}
                    className="bare-input"
                    required
                  />
                </div>
              </div>

              <div className="time-field">
                <span className="form-label font-mono">TIME (UTC)</span>
                <div className="inline-input-wrap">
                  <Clock size={16} />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(event) => setScheduledTime(event.target.value)}
                    className="bare-input"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="sp-primary-submit" disabled={submitting}>
              <Send size={16} />
              <span>{submitting ? "Scheduling..." : "Add to Publication Queue"}</span>
            </button>
          </form>
        </div>

        <div className="timeline-column">
          <div className="column-title-row hairline-b">
            <Layers size={18} />
            <h2 className="column-heading font-serif">Social Preview</h2>
          </div>

          {loading ? (
            <p>Loading preview...</p>
          ) : selectedPlatforms.length === 0 ? (
            <div className="preview-empty-state">
              <p>Select a platform to preview how your post will appear.</p>
            </div>
          ) : (
            <div className="social-preview-stack">
              {selectedPlatforms.map((platformKey) => renderPlatformPreview(platformKey))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Scheduler;
