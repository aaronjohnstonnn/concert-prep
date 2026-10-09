"use client";

import { useState } from "react";

export default function Home() {
  const [artistName, setArtistName] = useState("");
  const [submittedArtist, setSubmittedArtist] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedArtistName = artistName.trim();

    if (!trimmedArtistName) {
      setError("Enter an artist name before searching.");
      setSubmittedArtist("");
      return;
    }

    setError("");
    setSubmittedArtist(artistName);
  }

  return (
    <main>
      <section>
        <p>CONCERTPREP</p>

        <h1>Know every word before the first song plays.</h1>

        <p>Search for an artist and discover the best songs to listen to before your next concert.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="artist-search">Artist Name</label>

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

        {submittedArtist && (
          <p>
            Searching for: <strong>{submittedArtist}</strong>
          </p>
        )}

      </section>
    </main>
  )
}