"use client";

import { useState, useEffect } from "react";

type Track = {
  name: string;
  artist: string;
  album: string;
  spotifyURL: string;
};

export default function Home() {
  const [artistName, setArtistName] = useState("");
  const [submittedArtist, setSubmittedArtist] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedArtistName = artistName.trim();

    if (!trimmedArtistName) {
      setError("Enter an artist name before searching.");
      setSubmittedArtist("");
      return;
    }

    setError("");
    setSubmittedArtist(trimmedArtistName);
  }

  useEffect(() => {
    if (!submittedArtist) {
      setResults([]);
      return;
    }

    async function search() {
      setLoading(true);

      try {
        const res = await fetch(
          `/api/search?artist=${encodeURIComponent(submittedArtist)}`
        );

        const data = await res.json();

        if (data.tracks) {
          setResults(data.tracks);
          setError("");
        } else {
          setError(data.error ?? "Could not find tracks.");
          setResults([]);
        }
      } catch {
        setError("Something went wrong while searching.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    search();
  }, [submittedArtist]);

  return (
    <main>
      <section>
        <p>CONCERTPREP</p>

        <h1>Know every word before the first song plays.</h1>

        <p>Search for an artist and discover the best songs to listen to before your next concert.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="artist-search">Artist Name:</label>

          <div>
            <input 
            id="artist-search" 
            type="text" 
            placeholder="Search for an artist, for example: Drake"
            value={artistName}
            onChange={(event) => setArtistName(event.target.value)}
            />
            <button type="submit">Search</button>
          </div>
        </form>

        {error && <p className="error-message">{error}</p>}

        {loading && <p>Searching...</p>}

        {submittedArtist && (
          <h2>Tracks for {submittedArtist}:</h2>
        )}

        {results.length > 0 && (
          <ul>
            {results.map((track) => (
              <li key={track.spotifyURL}>
                <strong>{track.name}</strong>{track.artist}
                <br />
                <em>{track.album}</em>
                <br />
                <a
                  href={track.spotifyURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  >
                    <img
                    src="spotify.png"
                    alt={`Listen to ${track.name} on Spotify`}
                    >
                      </img>
                  </a>
              </li>
            ))}
          </ul>
        )}

      </section>
    </main>
  )
}