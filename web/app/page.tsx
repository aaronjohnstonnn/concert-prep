"use client";

import { useEffect, useState } from "react";

type Track = {
  name: string;
  artist: string;
  album: string;
  spotifyURL: string;
  albumImage: string;
};

type Artist = {
  id: string;
  name: string;
  image: string;
  genres: string[];
  spotifyURL: string;
};

const SAVED_TRACKS_KEY = "concertprep-saved-tracks";

export default function Home() {
  const [artistName, setArtistName] = useState("");
  const [submittedArtist, setSubmittedArtist] = useState("");
  const [artist, setArtist] = useState<Artist | null>(null);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const [hasLoadedSavedTracks, setHasLoadedSavedTracks] = useState(false);

  useEffect(() => {
    try {
      const storedTracks = window.localStorage.getItem(SAVED_TRACKS_KEY);

      if (storedTracks) {
        const parsedTracks = JSON.parse(storedTracks);

        if (Array.isArray(parsedTracks)) {
          setSavedTracks(parsedTracks);
        }
      }
    } catch {
      window.localStorage.removeItem(SAVED_TRACKS_KEY);
    } finally {
      setHasLoadedSavedTracks(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedTracks) {
      return;
    }

    window.localStorage.setItem(
      SAVED_TRACKS_KEY,
      JSON.stringify(savedTracks)
    );
  }, [savedTracks, hasLoadedSavedTracks]);

  function isTrackSaved(track: Track) {
    return savedTracks.some(
      (savedTrack) => savedTrack.spotifyURL === track.spotifyURL
    );
  }

  function toggleSavedTrack(track: Track) {
    const alreadySaved = isTrackSaved(track);

    if (alreadySaved) {
      setSavedTracks((currentTracks) =>
        currentTracks.filter(
          (savedTrack) => savedTrack.spotifyURL !== track.spotifyURL
        )
      );

      return;
    }

    setSavedTracks((currentTracks) => [...currentTracks, track]);
  }

  function removeSavedTrack(spotifyURL: string) {
    setSavedTracks((currentTracks) =>
      currentTracks.filter(
        (savedTrack) => savedTrack.spotifyURL !== spotifyURL
      )
    );
  }

  function clearSavedTracks() {
    setSavedTracks([]);
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedArtistName = artistName.trim();

    if (!trimmedArtistName) {
      setError("Enter an artist name before searching.");
      setSubmittedArtist("");
      setResults([]);
      setArtist(null);
      return;
    }

    setError("");
    setSubmittedArtist(trimmedArtistName);
  }

  useEffect(() => {
    if (!submittedArtist) {
      setResults([]);
      setArtist(null);
      return;
    }

    async function search() {
      setLoading(true);
      setResults([]);
      setArtist(null);
      setError("");

      try {
        const res = await fetch(
          `/api/search?artist=${encodeURIComponent(submittedArtist)}`
        );
        const data = await res.json();

        if (!res.ok || data.error) {
          setError(data.error ?? "Could not search Spotify.");
          return;
        }

        setArtist(data.artist ?? null);
        setResults(data.tracks ?? []);

        if (!data.tracks?.length) {
          setError(`No tracks found for ${submittedArtist}.`);
        }
      } catch {
        setError("Something went wrong while searching. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [submittedArtist]);

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="ConcertPrep home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="brand-name">
            Concert<span>Prep</span>
          </span>
        </a>

        <button
          className="my-list-nav-button"
          type="button"
          onClick={() => setIsListOpen(true)}
        >
          My List

          {savedTracks.length > 0 && (
            <>
              <span className="nav-divider" aria-hidden="true" />
              <span className="saved-count">{savedTracks.length}</span>
            </>
          )}
        </button>
      </header>

      <section className="hero" id="search">
        <div className="hero-content">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            YOUR PRE-SHOW RITUAL STARTS HERE
          </p>

          <h1>
            Know the songs.
            <br />
            Feel ready for the show.
          </h1>

          <p className="hero-description">
            Find an artist, discover the tracks to know, and get ready for your
            next live show.
          </p>

          <form className="search-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="artist-search">
              Search for an artist
            </label>

            <div className="search-control">
              <span className="search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                id="artist-search"
                type="text"
                placeholder="Search for an artist, e.g. Drake"
                value={artistName}
                onChange={(event) => setArtistName(event.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Searching…" : "Find your artist"}
              </button>
            </div>
          </form>

          <p className="hero-note">
            Discover essential tracks, save your favourites, and open them in
            Spotify.
          </p>
        </div>
      </section>

      <section className="results-section" aria-live="polite">
        {loading && (
          <div className="status-card">
            <span className="loading-ring" />
            <div>
              <h2>Finding your artist</h2>
              <p>Looking up tracks for {submittedArtist}…</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="status-card status-error" role="alert">
            <span className="status-symbol">!</span>
            <div>
              <h2>We couldn’t find those tracks</h2>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && artist && results.length > 0 && (
          <>
            <section className="artist-banner">
              {artist.image && (
                <img className="artist-image" src={artist.image} alt="" />
              )}
              <div className="artist-banner-shade" />

              <div className="artist-banner-content">
                <p className="eyebrow">YOUR ARTIST</p>
                <h2>{artist.name}</h2>

                {artist.genres.length > 0 && (
                  <div className="genre-list">
                    {artist.genres.slice(0, 3).map((genre) => (
                      <span className="genre-pill" key={genre}>
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                <p className="artist-tagline">
                  Get ready for {artist.name}.
                </p>

                {artist.spotifyURL && (
                  <a
                    className="spotify-button"
                    href={artist.spotifyURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      className="spotify-icon"
                      src="/spotify-icon.png"
                      alt=""
                      aria-hidden="true"
                    />
                    Open artist on Spotify
                  </a>
                )}
              </div>
            </section>

            <div className="tracks-heading">
              <div>
                <p className="eyebrow">THE PRE-SHOW ESSENTIALS</p>
                <h2>Tracks to know</h2>
              </div>
              <span className="track-count">
                {results.length} {results.length === 1 ? "track" : "tracks"}
              </span>
            </div>

            <ul className="track-list">
              {results.map((track, index) => {
                const saved = isTrackSaved(track);

                return (
                  <li className="track-card" key={track.spotifyURL}>
                    <span className="track-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {track.albumImage ? (
                      <img
                        className="album-cover"
                        src={track.albumImage}
                        alt={`Album cover for ${track.album}`}
                      />
                    ) : (
                      <div className="album-cover album-cover-fallback">♫</div>
                    )}

                    <div className="track-info">
                      <strong>{track.name}</strong>
                      <span>{track.artist}</span>
                      <em>{track.album}</em>
                    </div>

                    <a
                      className="track-spotify-link"
                      href={track.spotifyURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Listen to ${track.name} on Spotify`}
                    >
                      <span aria-hidden="true">▶</span>
                      <span className="track-spotify-label">Listen</span>
                    </a>

                    <button
                      className={`save-track-button ${saved ? "is-saved" : ""}`}
                      type="button"
                      onClick={() => toggleSavedTrack(track)}
                      aria-pressed={saved}
                      aria-label={
                        saved
                          ? `Remove ${track.name} from My List`
                          : `Save ${track.name} to My List`
                      }
                    >
                      <svg
                        className="save-track-icon"
                        viewBox="0 0 24 24"
                        fill={saved ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-intro">
          <p className="eyebrow">A BETTER WAY TO GET READY</p>
          <h2>Make the most of the moment.</h2>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>
            <h3>Find your artist</h3>
            <p>Search the artist you’re about to see live.</p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>
            <h3>Discover the tracks</h3>
            <p>Explore essential songs and album artwork.</p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>
            <h3>Build your list</h3>
            <p>Save your favourites so you know what to hear before the show.</p>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="/" aria-label="ConcertPrep home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="brand-name">
            Concert<span>Prep</span>
          </span>
        </a>

        <p>Know the songs. Feel ready for the show.</p>

        <span className="footer-credit">
          Made for the moments that matter.
        </span>
      </footer>

      <div
        className={`list-overlay ${isListOpen ? "is-open" : ""}`}
        onClick={() => setIsListOpen(false)}
      >
        <div className="list-overlay-blur" aria-hidden="true" />

        <aside
          className="my-list-drawer"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="drawer-header">
            <div>
              <p className="eyebrow">SAVED FOR THE SHOW</p>
              <h2>Your Pre-Show List</h2>
            </div>

            <button
              className="drawer-close-button"
              type="button"
              onClick={() => setIsListOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="drawer-toolbar">
            <p className="drawer-description">
              {savedTracks.length === 0
                ? "Save tracks from any artist search and they will appear here."
                : `${savedTracks.length} ${
                    savedTracks.length === 1 ? "track" : "tracks"
                  } saved for your next show.`}
            </p>

            {savedTracks.length > 0 && (
              <button
                className="clear-list-button"
                type="button"
                onClick={clearSavedTracks}
              >
                Clear list
              </button>
            )}
          </div>

          {savedTracks.length === 0 ? (
            <div className="empty-list-state">
              <span className="empty-list-icon" aria-hidden="true">
                ♡
              </span>
              <h3>Your list is waiting</h3>
              <p>
                Search an artist, then save tracks you want to hear before the
                show.
              </p>
              <button
                className="empty-list-button"
                type="button"
                onClick={() => setIsListOpen(false)}
              >
                Search for an artist
              </button>
            </div>
          ) : (
            <ul className="saved-track-list">
              {savedTracks.map((track) => (
                <li className="saved-track-card" key={track.spotifyURL}>
                  {track.albumImage ? (
                    <img
                      className="saved-album-cover"
                      src={track.albumImage}
                      alt={`Album cover for ${track.album}`}
                    />
                  ) : (
                    <div className="saved-album-cover album-cover-fallback">
                      ♫
                    </div>
                  )}

                  <div className="saved-track-info">
                    <strong>{track.name}</strong>
                    <span>{track.artist}</span>
                    <em>{track.album}</em>
                  </div>

                  <div className="saved-track-actions">
                    <a
                      className="saved-spotify-link"
                      href={track.spotifyURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Listen to ${track.name} on Spotify`}
                    >
                      ▶
                    </a>

                    <button
                      className="remove-track-button"
                      type="button"
                      onClick={() => removeSavedTrack(track.spotifyURL)}
                      aria-label={`Remove ${track.name} from My List`}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}