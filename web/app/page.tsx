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

export default function Home() {
  const [artistName, setArtistName] = useState("");
  const [submittedArtist, setSubmittedArtist] = useState("");
  const [artist, setArtist] = useState<Artist | null>(null);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

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

        <nav className="header-nav" aria-label="Main navigation">
          <a href="#search">Search</a>
          <a href="#how-it-works">How it works</a>
        </nav>
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
                placeholder="Search for an artist, e.g. Tame Impala"
                value={artistName}
                onChange={(event) => setArtistName(event.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Searching…" : "Find your artist"}
              </button>
            </div>
          </form>

          <p className="hero-note">
            Discover essential tracks and open them in Spotify.
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
                <img
                  className="artist-image"
                  src={artist.image}
                  alt=""
                />
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
              {results.map((track, index) => (
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
                    <div className="album-cover album-cover-fallback">
                      ♫
                    </div>
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
                </li>
              ))}
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
            <h3>Listen before the show</h3>
            <p>Open tracks directly in Spotify and feel ready.</p>
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
        <span className="footer-credit">Made for the moments that matter.</span>
      </footer>
    </main>
  );
}