import { useEffect, useMemo, useState } from 'react';
import { getPosts } from '../../services/postService';
import './CalendarView.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setError('');
        const data = await getPosts();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err.message || 'Unable to load scheduled posts.');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get weekday of 1st day (0 = Sun, 1 = Mon, ..., 6 = Sat)
  // Convert to Mon=0, Tue=1, ..., Sun=6 layout
  const rawFirstDay = new Date(year, month, 1).getDay();
  const paddingDays = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

  const scheduledPosts = useMemo(
    () => posts.filter((post) => post.scheduled_time && !['Cancelled', 'Failed'].includes(post.status)),
    [posts]
  );

  const getPostsForDay = (dayNumber) => scheduledPosts.filter((post) => {
    const scheduledDate = new Date(post.scheduled_time);
    return (
      scheduledDate.getFullYear() === year &&
      scheduledDate.getMonth() === month &&
      scheduledDate.getDate() === dayNumber
    );
  });

  const formatPostTime = (scheduledTime) =>
    new Date(scheduledTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div>
          <p className="eyebrow-text font-mono">PUBLISHING CALENDAR</p>
          <h2>Content Schedule</h2>
          <p className="page-subtitle">
            Track planned posts across the month and keep your publishing rhythm aligned.
          </p>
        </div>
        <div className="calendar-nav">
          <button className="nav-btn" onClick={handlePrevMonth}>&lt;</button>
          <span>{monthNames[month]} {year}</span>
          <button className="nav-btn" onClick={handleNextMonth}>&gt;</button>
        </div>
      </div>
      {loading && <p className="calendar-state">Loading scheduled posts...</p>}
      {error && <p className="calendar-state calendar-error">{error}</p>}
      <div className="calendar-grid">
        {DAYS.map((day) => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        
        {/* Render empty slots for days before the 1st of the month */}
        {Array.from({ length: paddingDays }).map((_, idx) => (
          <div key={`padding-${idx}`} className="calendar-cell empty-cell"></div>
        ))}

        {/* Render actual days of the month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dayPosts = getPostsForDay(dayNum);
          return (
            <div key={dayNum} className="calendar-cell">
              <span className="date-num">{dayNum}</span>
              {dayPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="event-pill"
                  title={post.title || post.caption || 'Scheduled post'}
                >
                  {formatPostTime(post.scheduled_time)} {post.title || post.caption || 'Untitled post'}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {!loading && !error && scheduledPosts.length === 0 && (
        <p className="calendar-state">No scheduled posts yet. Create one from the Scheduler.</p>
      )}
    </div>
  );
}