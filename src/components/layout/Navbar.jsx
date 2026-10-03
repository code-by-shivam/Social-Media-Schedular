import React, { useEffect, useState } from "react";
import {
  Search,
  Bell,
  Settings,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const [searchValue, setSearchValue] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [activeMatch, setActiveMatch] = useState(-1);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const contentRoot = document.querySelector(".sp-main-content");

    if (!contentRoot) {
      return undefined;
    }

    const clearHighlights = () => {
      contentRoot.querySelectorAll("mark.global-search-highlight").forEach((mark) => {
        const parent = mark.parentNode;

        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent), mark);
          parent.normalize();
        }
      });
    };

    clearHighlights();
    const query = searchValue.trim();

    if (!query) {
      setMatchCount(0);
      setActiveMatch(-1);
      return clearHighlights;
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matcher = new RegExp(escapedQuery, "gi");
    const walker = document.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        const excluded = parent?.closest(
          "input, textarea, select, button, script, style, mark"
        );

        return node.nodeValue.trim() && !excluded
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });
    const textNodes = [];
    let currentNode = walker.nextNode();

    while (currentNode) {
      textNodes.push(currentNode);
      currentNode = walker.nextNode();
    }

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match = matcher.exec(text);

      while (match) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        const highlight = document.createElement("mark");
        highlight.className = "global-search-highlight";
        highlight.textContent = match[0];
        fragment.appendChild(highlight);
        lastIndex = match.index + match[0].length;
        match = matcher.exec(text);
      }

      if (lastIndex > 0) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    });

    const matches = contentRoot.querySelectorAll("mark.global-search-highlight");
    setMatchCount(matches.length);
    setActiveMatch(matches.length > 0 ? 0 : -1);

    const initialScrollFrame = matches.length > 0
      ? requestAnimationFrame(() => {
          matches[0].scrollIntoView({ behavior: "smooth", block: "center" });
        })
      : null;

    return () => {
      if (initialScrollFrame) {
        cancelAnimationFrame(initialScrollFrame);
      }

      clearHighlights();
    };
  }, [pathname, searchValue]);

  useEffect(() => {
    const matches = document.querySelectorAll("mark.global-search-highlight");

    matches.forEach((match, index) => {
      match.classList.toggle("active", index === activeMatch);
    });

    if (activeMatch >= 0 && matches[activeMatch]) {
      matches[activeMatch].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeMatch]);

  const moveToMatch = (direction) => {
    if (matchCount === 0) {
      return;
    }

    setActiveMatch((currentMatch) => {
      if (currentMatch < 0) {
        return direction > 0 ? 0 : matchCount - 1;
      }

      return (currentMatch + direction + matchCount) % matchCount;
    });
  };

  const handleSearch = (event) => {
    event.preventDefault();
  };

  return (
    <header className="sp-navbar">
      <div className="nav-left">
        <form className="search-wrapper" onSubmit={handleSearch}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search campaigns, metrics, posts..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
            aria-label="Search workspace"
          />
          {searchValue && (
            <span className="search-results-count" aria-live="polite">
              {activeMatch >= 0 ? activeMatch + 1 : 0} / {matchCount}
            </span>
          )}
          {searchValue && matchCount > 0 && (
            <div className="search-navigation" aria-label="Search result navigation">
              <button
                type="button"
                className="search-nav-button"
                onClick={() => moveToMatch(-1)}
                aria-label="Previous search result"
                title="Previous result"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="search-nav-button"
                onClick={() => moveToMatch(1)}
                aria-label="Next search result"
                title="Next result"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          )}
          {searchValue && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearchValue("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      <div className="nav-right">
        <button
          className="nav-action-btn"
          onClick={() => navigate("/scheduler")}
          title="New Post"
        >
          <Sparkles size={15} />
          <span>New Post</span>
        </button>

        <button
          className="nav-icon-btn"
          onClick={() => navigate("/settings")}
          title="Notifications"
        >
          <Bell size={18} />
          <span className="notif-badge"></span>
        </button>

        <button
          className="nav-icon-btn"
          onClick={() => navigate("/settings")}
          title="Settings"
        >
          <Settings size={18} />
        </button>

        <div className="nav-divider"></div>

        <div className="nav-user-preview" onClick={() => navigate("/profile")}>
          <img
            src="/images.jpg"
            alt="Alex Vance"
            className="nav-avatar-img"
          />
          <span className="nav-user-name">{user?.name?.split(" ")[0] || "User"}</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;