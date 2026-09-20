import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Heart,
  Mail,
  Menu,
  Moon,
  MessageCircle,
  Send,
  Trash2,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Upload,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { book, chapters, characterIntro, references, illustrations } from "./story";

const STORAGE_KEY = "shadowfang-reader-v1";
const PROFILE_STORAGE_KEY = "storyhaven-profiles-v1";
const OWNER_EMAIL = "afzal03072010@gmail.com";

const featuredStory = {
  id: "shadowfang-island",
  title: book.title,
  author: book.authors.join(" · "),
  genre: "Adventure",
  description: book.description,
  chapters,
  cover: illustrations.cover,
};

function loadReaderState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function App() {
  const saved = loadReaderState();
  const savedGender = ["Female", "Male", "Other"].includes(saved.gender) ? saved.gender : "";

  const [screen, setScreen] = useState(saved.email ? "home" : "welcome");
  const [username, setUsername] = useState(saved.username || "");
  const [email, setEmail] = useState(saved.email || "");
  const [draftName, setDraftName] = useState(saved.username || "");
  const [draftEmail, setDraftEmail] = useState(saved.email || "");
  const [age, setAge] = useState(saved.age || "");
  const [gender, setGender] = useState(savedGender);
  const [draftAge, setDraftAge] = useState(saved.age || "");
  const [draftGender, setDraftGender] = useState(savedGender);
  const [profiles, setProfiles] = useState(() => {
    const storedProfiles = loadProfiles();
    return Object.keys(storedProfiles).length ? storedProfiles : (saved.profiles || {});
  });
  const [chapterId, setChapterId] = useState(saved.chapterId || 1);
  const [activeStoryId, setActiveStoryId] = useState(saved.activeStoryId || featuredStory.id);
  const [uploadedStories, setUploadedStories] = useState(saved.uploadedStories || []);
  const [readCounts, setReadCounts] = useState(saved.readCounts || { [featuredStory.id]: 0 });
  const [fontSize, setFontSize] = useState(saved.fontSize || 19);
  const [darkMode, setDarkMode] = useState(saved.darkMode ?? true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAuthor, setUploadAuthor] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadGenre, setUploadGenre] = useState("Adventure");
  const [uploadCover, setUploadCover] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All stories");
  const [likedStories, setLikedStories] = useState(saved.likedStories || []);
  const [readingList, setReadingList] = useState(saved.readingList || []);
  const [followingAuthors, setFollowingAuthors] = useState(saved.followingAuthors || []);
  const [comments, setComments] = useState(saved.comments || {});
  const [commentDraft, setCommentDraft] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);

  const stories = [featuredStory, ...uploadedStories];
  const activeStory = stories.find((item) => item.id === activeStoryId) ?? featuredStory;
  const activeChapters = activeStory.chapters;
  const isOwner = email.toLowerCase() === OWNER_EMAIL;
  const filteredStories = stories.filter((story) =>
    `${story.title} ${story.author} ${story.description}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedGenre === "All stories" || story.genre === selectedGenre)
  );

  const chapter = useMemo(
    () => activeChapters.find((item) => item.id === chapterId) ?? activeChapters[0],
    [activeChapters, chapterId]
  );

  const progress = Math.round((chapterId / activeChapters.length) * 100);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        username,
        email,
        age,
        gender,
        chapterId,
        activeStoryId,
        uploadedStories,
        readCounts,
        likedStories,
        readingList,
        followingAuthors,
        comments,
        fontSize,
        darkMode,
      })
    );
  }, [username, email, age, gender, profiles, chapterId, activeStoryId, uploadedStories, readCounts, likedStories, readingList, followingAuthors, comments, fontSize, darkMode]);

  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (!email) return;
    setProfiles((items) => items[email.toLowerCase()] ? items : {
      ...items,
      [email.toLowerCase()]: { username, age, gender, email },
    });
  }, [email, username, age, gender]);

  useEffect(() => {
    function syncProfiles(event) {
      if (event.key !== PROFILE_STORAGE_KEY || !event.newValue) return;
      try {
        setProfiles(JSON.parse(event.newValue));
      } catch {
        setProfiles({});
      }
    }
    window.addEventListener("storage", syncProfiles);
    return () => window.removeEventListener("storage", syncProfiles);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen, chapterId]);

  function startReading(event) {
    event?.preventDefault();
    const cleanName = draftName.trim();
    const cleanEmail = draftEmail.trim();
    const cleanAge = Number(draftAge);
    if (!cleanName || !cleanEmail || !cleanEmail.includes("@") || !cleanAge || cleanAge < 13 || cleanAge > 120 || !draftGender) return;
    setUsername(cleanName);
    setEmail(cleanEmail);
    setAge(cleanAge);
    setGender(draftGender);
    setProfiles((items) => ({ ...items, [cleanEmail.toLowerCase()]: { username: cleanName, age: cleanAge, gender: draftGender, email: cleanEmail } }));
    setScreen("home");
  }

  function saveProfile(event) {
    event.preventDefault();
    const cleanAge = Number(draftAge);
    if (!cleanAge || cleanAge < 13 || cleanAge > 120 || !draftGender) return;
    setAge(cleanAge);
    setGender(draftGender);
    setProfiles((items) => ({ ...items, [email.toLowerCase()]: { username, age: cleanAge, gender: draftGender, email } }));
    setEditingProfile(false);
  }

  function resetReader() {
    localStorage.removeItem(STORAGE_KEY);
    setUsername("");
    setEmail("");
    setDraftName("");
    setDraftEmail("");
    setAge("");
    setGender("");
    setDraftAge("");
    setDraftGender("");
    setChapterId(1);
    setActiveStoryId(featuredStory.id);
    setUploadedStories([]);
    setReadCounts({ [featuredStory.id]: 0 });
    setLikedStories([]);
    setReadingList([]);
    setFollowingAuthors([]);
    setComments({});
    setSearchQuery("");
    setSelectedGenre("All stories");
    setScreen("welcome");
    setMenuOpen(false);
  }

  function openChapter(id) {
    setChapterId(id);
    setReadCounts((counts) => ({ ...counts, [activeStoryId]: (counts[activeStoryId] || 0) + 1 }));
    setScreen("reader");
    setMenuOpen(false);
  }

  function openStory(storyId) {
    setActiveStoryId(storyId);
    setChapterId(1);
    setReadCounts((counts) => ({ ...counts, [storyId]: (counts[storyId] || 0) + 1 }));
    setScreen("reader");
  }

  function uploadStory(event) {
    event.preventDefault();
    const title = uploadTitle.trim();
    const text = uploadText.trim();
    if (!title || !text) return;
    const storyId = `community-${Date.now()}`;
    const newStory = {
      id: storyId,
      title,
      author: uploadAuthor.trim() || username,
      ownerEmail: email,
      genre: uploadGenre,
      cover: uploadCover ? { src: uploadCover, alt: `${title} cover` } : null,
      description: uploadDescription.trim() || "A new story shared with the community.",
      chapters: [{ id: 1, title, paragraphs: text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean) }],
    };
    setUploadedStories((items) => [newStory, ...items]);
    setUploadTitle("");
    setUploadAuthor("");
    setUploadDescription("");
    setUploadGenre("Adventure");
    setUploadCover("");
    setUploadText("");
    setShowUpload(false);
  }

  function deleteStory(story) {
    if (story.ownerEmail !== email) return;
    if (!window.confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
    setUploadedStories((items) => items.filter((item) => item.id !== story.id));
    setReadCounts((counts) => {
      const nextCounts = { ...counts };
      delete nextCounts[story.id];
      return nextCounts;
    });
    setLikedStories((items) => items.filter((item) => item !== story.id));
    if (activeStoryId === story.id) {
      setActiveStoryId(featuredStory.id);
      setChapterId(1);
      setScreen("home");
    }
  }

  function loadStoryFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadText(String(reader.result || ""));
    reader.readAsText(file);
  }

  function loadCoverFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadCover(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function openWriter() {
    setShowUpload(true);
    setScreen("profile");
    setMenuOpen(false);
  }

  function openDiscover() {
    setScreen("home");
    window.setTimeout(() => {
      document.getElementById("library")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }

  function toggleLike(storyId) {
    setLikedStories((items) => items.includes(storyId) ? items.filter((item) => item !== storyId) : [...items, storyId]);
  }

  function toggleReadingList(storyId) {
    setReadingList((items) => items.includes(storyId) ? items.filter((item) => item !== storyId) : [...items, storyId]);
  }

  function toggleFollow(author) {
    setFollowingAuthors((items) => items.includes(author) ? items.filter((item) => item !== author) : [...items, author]);
  }

  function addComment(event) {
    event.preventDefault();
    const text = commentDraft.trim();
    if (!text) return;
    const comment = { id: Date.now(), author: username, text, createdAt: new Date().toISOString() };
    setComments((items) => ({ ...items, [activeStory.id]: [...(items[activeStory.id] || []), comment] }));
    setCommentDraft("");
  }

  function nextChapter() {
    if (chapterId < activeChapters.length) setChapterId(chapterId + 1);
  }

  function previousChapter() {
    if (chapterId > 1) setChapterId(chapterId - 1);
  }

  if (screen === "welcome") {
    return (
      <div className={`site ${darkMode ? "dark" : "light"}`}>
        <main className="welcome-page">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <section className="welcome-card">
            <div className="brand-mark">
              <span className="logo-letters">SH</span>
            </div>
            <div className="login-brand-name">StoryHaven</div>
            <div className="eyebrow">YOUR COMMUNITY STORY LIBRARY</div>

            <p className="welcome-copy">
              Sign in with your email, read free stories, and share a story book of your own.
            </p>

            <form className="name-form" onSubmit={startReading}>
              <label htmlFor="reader-email">
                <Mail size={17} />
                Email address
              </label>
              <input
                id="reader-email"
                type="email"
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <label htmlFor="reader-name">
                <UserRound size={17} />
                Your reader name
              </label>
              <input
                id="reader-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. ShadowReader"
                maxLength={30}
                autoComplete="off"
              />
              <label htmlFor="reader-age">Age</label>
              <input
                id="reader-age"
                type="number"
                min="13"
                max="120"
                value={draftAge}
                onChange={(e) => setDraftAge(e.target.value)}
                placeholder="18"
                required
              />
              <label htmlFor="reader-gender">Gender</label>
              <select id="reader-gender" value={draftGender} onChange={(e) => setDraftGender(e.target.value)}>
                <option value="" disabled>Select gender</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
              <button className="primary-button" type="submit" disabled={!draftName.trim() || !draftEmail.trim() || !draftAge || !draftGender}>
                Sign in and enter
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="tiny-note">
              Demo login: your email and stories stay in this browser.
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`site ${darkMode ? "dark" : "light"}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand-button" onClick={() => setScreen("home")}>
            <span className="brand-icon">
              <BookOpen size={19} />
            </span>
            <span>
              <strong>StoryHaven</strong>
              <small>Story Library</small>
            </span>
          </button>

          <nav className="site-nav" aria-label="Main navigation">
            <button className="site-nav-active" onClick={() => setScreen("home")}>Home</button>
            <button onClick={openDiscover}>Discover</button>
            <button onClick={openWriter}>Write</button>
            <button onClick={() => setScreen("profile")}>Profile</button>
          </nav>

          <div className="topbar-actions">
            <button
              className="icon-button"
              onClick={() => setDarkMode((value) => !value)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="menu-button"
              onClick={() => setMenuOpen((value) => !value)}
              title="Open menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="menu-panel">
            <div className="reader-chip">
              <span className="avatar">
                {username.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <strong>{username}</strong>
                <small>{email}</small>
              </div>
            </div>
            <button
              onClick={() => {
                setScreen("home");
                setMenuOpen(false);
              }}
            >
              <BookOpen size={16} /> Home
            </button>
            <button
              onClick={() => {
                openStory(activeStoryId);
                setMenuOpen(false);
              }}
            >
              <Play size={16} /> Continue reading
            </button>
            <button onClick={openWriter}>
              <Upload size={16} /> Upload a story
            </button>
            <button onClick={() => { setScreen("profile"); setMenuOpen(false); }}>
              <UserRound size={16} /> My profile
            </button>
            <button onClick={resetReader}>
              <RotateCcw size={16} /> Change reader name
            </button>
          </div>
        )}
      </header>

      {screen === "home" ? (
        <main className="page">
          <section className="discovery-hero">
            <div>
              <span className="eyebrow"><Sparkles size={15} /> Welcome back, {username}</span>
              <h1>Find a story worth staying up for.</h1>
              <p>Read original books from the StoryHaven community, or share the one you have been writing.</p>
            </div>
          </section>

          <section className="discovery-tools" id="library">
            <label className="search-box">
              <Search size={18} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search books or authors" />
            </label>
            <div className="genre-row" aria-label="Browse genres">
              {['All stories', 'Adventure', 'Mystery', 'Romance', 'Fantasy'].map((genre) => (
                <button key={genre} className={selectedGenre === genre ? "selected" : ""} onClick={() => setSelectedGenre(genre)}>{genre}</button>
              ))}
            </div>
          </section>

          <section className="content-section library-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">DISCOVER YOUR NEXT READ</span>
                <h3>Community books</h3>
              </div>
            </div>

            <div className="story-library">
              {filteredStories.map((story) => (
                <article className="story-card" key={story.id}>
                  {story.cover ? <img className="story-card-cover" src={story.cover.src} alt={story.cover.alt} /> : <div className="story-card-mark"><BookOpen size={21} /></div>}
                  <div className="story-card-copy">
                    <span className="section-kicker">{story.genre} · {story.id === featuredStory.id ? "FEATURED BOOK" : "COMMUNITY BOOK"}</span>
                    <h4>{story.title}</h4>
                    <p>{story.description}</p>
                    <small>By {story.author} · {readCounts[story.id] || 0} readers</small>
                  </div>
                  <div className="story-card-actions">
                    <button className={`icon-button story-like ${readingList.includes(story.id) ? "saved" : ""}`} onClick={() => toggleReadingList(story.id)} aria-label="Save book" aria-pressed={readingList.includes(story.id)}>
                      <Bookmark size={16} fill={readingList.includes(story.id) ? "currentColor" : "none"} />
                    </button>
                    <button className={`icon-button story-like ${likedStories.includes(story.id) ? "liked" : ""}`} onClick={() => toggleLike(story.id)} aria-label="Like book" aria-pressed={likedStories.includes(story.id)}>
                      <Heart size={16} fill={likedStories.includes(story.id) ? "currentColor" : "none"} />
                    </button>
                    {story.ownerEmail === email && (
                      <button className="icon-button story-delete" onClick={() => deleteStory(story)} aria-label={`Delete ${story.title}`} title="Delete your book">
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button className="secondary-button" onClick={() => openStory(story.id)}><Play size={16} /> Read</button>
                  </div>
                </article>
              ))}
              {!filteredStories.length && <p className="empty-library">No books match that search yet.</p>}
            </div>
          </section>

        </main>
      ) : screen === "profile" ? (
        <main className="profile-page page">
          <section className="profile-header">
            <div className="profile-avatar">{username.slice(0, 1).toUpperCase()}</div>
            <div>
              <span className="section-kicker">STORYHAVEN AUTHOR</span>
              <h1>{username}</h1>
              <p>{email}</p>
            </div>
          </section>
          <div className="profile-stats">
            <div><strong>{uploadedStories.filter((story) => story.ownerEmail === email).length}</strong><span>Published books</span></div>
            <div><strong>{followingAuthors.length}</strong><span>Following</span></div>
            <div><strong>{readingList.length}</strong><span>Saved books</span></div>
          </div>
          <section className="profile-details">
            <div className="section-heading">
              <div><span className="section-kicker">PRIVATE ACCOUNT DETAILS</span><h3>My profile details</h3></div>
              <button className="secondary-button" onClick={() => { setDraftAge(age); setDraftGender(gender); setEditingProfile((value) => !value); }}>
                {editingProfile ? "Cancel" : "Edit details"}
              </button>
            </div>
            {editingProfile ? (
              <form className="profile-edit-form" onSubmit={saveProfile}>
                <label>Age<input type="number" min="13" max="120" value={draftAge} onChange={(e) => setDraftAge(e.target.value)} required /></label>
                <label>Gender<select value={draftGender} onChange={(e) => setDraftGender(e.target.value)} required><option value="" disabled>Select gender</option><option>Female</option><option>Male</option><option>Other</option></select></label>
                <button className="primary-button" type="submit">Save details</button>
              </form>
            ) : (
              <div className="private-details-grid"><div><span>Age</span><strong>{age || "Not set"}</strong></div><div><span>Gender</span><strong>{gender || "Not set"}</strong></div><p>Only you can view and edit your personal details.</p></div>
            )}
          </section>
          {isOwner && (
            <section className="owner-directory">
              <div className="section-heading"><div><span className="section-kicker">OWNER VIEW</span><h3>Other account entries</h3></div><Users size={20} /></div>
              <div className="directory-list">
                {Object.values(profiles).filter((profile) => profile.email.toLowerCase() !== email.toLowerCase()).map((profile) => (
                  <article className="directory-entry" key={profile.email}><div className="avatar">{profile.username.slice(0, 1).toUpperCase()}</div><div><strong>{profile.username}</strong><span>{profile.email}</span></div><div><span>Age</span><strong>{profile.age}</strong></div><div><span>Gender</span><strong>{profile.gender}</strong></div></article>
                ))}
                {!Object.values(profiles).some((profile) => profile.email.toLowerCase() !== email.toLowerCase()) && <p className="empty-library">Other registered entries will appear here.</p>}
              </div>
            </section>
          )}
          {readingList.length > 0 && (
            <section className="shelf-section">
              <div className="shelf-heading"><div><span className="section-kicker">YOUR LIBRARY</span><h3>Saved for later</h3></div><ChevronRight size={20} /></div>
              <div className="mini-shelf">
                {stories.filter((story) => readingList.includes(story.id)).map((story) => (
                  <button className="mini-book" key={story.id} onClick={() => openStory(story.id)}><span>{story.title}</span><small>{story.genre}</small></button>
                ))}
              </div>
            </section>
          )}
          <section className="profile-section">
            <div className="section-heading"><div><span className="section-kicker">YOUR WRITING</span><h3>Published by you</h3></div><button className="primary-button" onClick={() => setShowUpload((value) => !value)}><Upload size={17} /> {showUpload ? "Close writer" : "Publish a book"}</button></div>
            {showUpload && (
              <form className="upload-form" onSubmit={uploadStory}>
                <div className="form-grid">
                  <label>Book title<input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} required /></label>
                  <label>Author name<input value={uploadAuthor} onChange={(e) => setUploadAuthor(e.target.value)} placeholder={username} /></label>
                </div>
                <label>Genre<select value={uploadGenre} onChange={(e) => setUploadGenre(e.target.value)}><option>Adventure</option><option>Mystery</option><option>Romance</option><option>Fantasy</option></select></label>
                <label>Book cover<input type="file" accept="image/*" onChange={loadCoverFile} /></label>
                <label>Short description<input value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="What is this story about?" /></label>
                <label>Story file<input type="file" accept=".txt,text/plain" onChange={loadStoryFile} required /></label>
                <button className="primary-button" type="submit"><Upload size={17} /> Publish to this browser</button>
              </form>
            )}
            <div className="story-library">
              {uploadedStories.filter((story) => story.ownerEmail === email).map((story) => <article className="story-card" key={story.id}><div className="story-card-mark"><BookOpen size={21} /></div><div className="story-card-copy"><span className="section-kicker">{story.genre}</span><h4>{story.title}</h4><small>{readCounts[story.id] || 0} readers</small></div><button className="secondary-button" onClick={() => openStory(story.id)}><Play size={16} /> Read</button></article>)}
              {!uploadedStories.some((story) => story.ownerEmail === email) && <p className="empty-library">Your published books will appear here.</p>}
            </div>
          </section>
        </main>
      ) : (
        <main className="reader-shell">
          <div className="reader-top">
            <button className="back-link" onClick={() => setScreen("home")}>
              <ArrowLeft size={17} /> Back to books
            </button>

            <div className="reader-tools">
              <button className="tool-button" onClick={() => setFontSize((s) => Math.max(16, s - 1))}>
                A−
              </button>
              <span>{fontSize}px</span>
              <button className="tool-button" onClick={() => setFontSize((s) => Math.min(26, s + 1))}>
                A+
              </button>
            </div>
          </div>

          <div className="reader-progress" aria-label={`Reading progress: ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <article className="reader-card">
            <div className="reader-meta">
              <span>Chapter {chapter.id} of {activeChapters.length} · {readCounts[activeStory.id] || 0} readers</span>
              <div className="reader-meta-actions">
                <button className={`reader-save ${readingList.includes(activeStory.id) ? "saved" : ""}`} onClick={() => toggleReadingList(activeStory.id)} title="Save to reading list"><Bookmark size={17} fill={readingList.includes(activeStory.id) ? "currentColor" : "none"} /></button>
                <button className="reader-follow" onClick={() => toggleFollow(activeStory.author)}>{followingAuthors.includes(activeStory.author) ? "Following" : "Follow author"}</button>
              </div>
            </div>
            <h1>{chapter.title}</h1>
            <div className="chapter-rule" />

            <div className="story-text" style={{ fontSize: `${fontSize}px` }}>
              {chapter.paragraphs.map((paragraph, index) => {
                const chapterImages = illustrations.chapters[chapter.id] || [];
                const matchingImages = chapterImages.filter((image) => image.after === paragraph);
                const beforeImages = index === 0 ? chapterImages.filter((image) => image.before) : [];
                const isQuote =
                  paragraph.startsWith("“") ||
                  paragraph.startsWith("“") ||
                  paragraph === "“I AM WAITING”" ||
                  paragraph.startsWith("•") ||
                  paragraph === "THE STORY BEGINS HERE" ||
                  paragraph === "THE SHADOWFANG ISLAND";

                const isHeading =
                  /^(\\d+)\\./.test(paragraph) ||
                  paragraph === "THE STORY BEGINS HERE" ||
                  paragraph === "THE SHADOWFANG ISLAND";

                return (
                  <div key={`${chapter.id}-${index}`}>
                    {beforeImages.map((image) => (
                      <figure className="story-illustration" key={image.src}>
                        <img src={image.src} alt={image.alt} loading="lazy" />
                      </figure>
                    ))}
                    <p
                      className={`${isQuote ? "story-quote" : ""} ${isHeading ? "story-heading" : ""}`}
                    >
                      {paragraph}
                    </p>
                    {matchingImages.map((image) => (
                      <figure className="story-illustration" key={image.src}>
                        <img src={image.src} alt={image.alt} loading="lazy" />
                      </figure>
                    ))}
                  </div>
                );
              })}
            </div>
          </article>

          <section className="comments-section">
            <div className="section-heading"><div><span className="section-kicker"><MessageCircle size={14} /> READER COMMUNITY</span><h3>Comments</h3></div><span className="comment-count">{(comments[activeStory.id] || []).length}</span></div>
            <form className="comment-form" onSubmit={addComment}>
              <input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Share your thoughts about this story" maxLength={240} />
              <button className="primary-button" type="submit" disabled={!commentDraft.trim()}><Send size={16} /> Post</button>
            </form>
            <div className="comment-list">
              {(comments[activeStory.id] || []).map((comment) => <article className="comment" key={comment.id}><span className="avatar">{comment.author.slice(0, 1).toUpperCase()}</span><div><strong>{comment.author}</strong><p>{comment.text}</p></div></article>)}
              {!comments[activeStory.id]?.length && <p className="empty-library">Be the first reader to start the conversation.</p>}
            </div>
          </section>

          <div className="chapter-nav">
            <button
              className="secondary-button nav-button"
              onClick={previousChapter}
              disabled={chapterId === 1}
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            <div className="chapter-dots">
              {activeChapters.map((item) => (
                <button
                  key={item.id}
                  className={item.id === chapterId ? "active" : ""}
                  onClick={() => setChapterId(item.id)}
                  aria-label={`Go to chapter ${item.id}`}
                />
              ))}
            </div>

            <button
              className="primary-button nav-button"
              onClick={nextChapter}
              disabled={chapterId === activeChapters.length}
            >
              Next
              <ArrowRight size={18} />
            </button>
          </div>

          {chapterId === activeChapters.length && (
            <div className="finish-card">
              <img className="ending-art" src={illustrations.backCover.src} alt={illustrations.backCover.alt} />
              <div className="finish-icon"><Sparkles size={22} /></div>
              <h3>You reached the end, {username}.</h3>
              <p>Thank you for reading {activeStory.title}.</p>
              <button className="secondary-button" onClick={() => setScreen("home")}>
                Return to the home page
              </button>
            </div>
          )}
        </main>
      )}

      <footer className="footer">
        <span>© {new Date().getFullYear()} StoryHaven</span>
        <span><Users size={13} /> {readCounts[activeStory.id] || 0} readers on the current book</span>
      </footer>
    </div>
  );
}
