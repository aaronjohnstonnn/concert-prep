import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const artistName = request.nextUrl.searchParams.get("artist");
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!artistName?.trim()) {
    return NextResponse.json(
      { error: "Enter an artist name before searching." },
      { status: 400 }
    );
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Spotify credentials are missing from the server configuration." },
      { status: 500 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const tokenResponse = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    }
  );

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "Could not get a Spotify access token." },
      { status: 500 }
    );
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const artistResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      artistName
    )}&type=artist&limit=1&market=AU`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!artistResponse.ok) {
    return NextResponse.json(
      { error: "Could not search for that artist on Spotify." },
      { status: 500 }
    );
  }

  const artistData = await artistResponse.json();
  const artist = artistData.artists.items[0];

  if (!artist) {
    return NextResponse.json(
      { error: `No artist found for "${artistName}".` },
      { status: 404 }
    );
  }

  const searchedName = artistName.trim().toLowerCase();
  const foundName = artist.name.toLowerCase();

  if (searchedName !== foundName) {
    return NextResponse.json(
      { error: `No exact artist found for "${artistName}".` },
      { status: 404 }
    );
  }

  const trackQuery = artist.name;
  const spotifyResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      trackQuery
    )}&type=track&limit=6&market=AU`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!spotifyResponse.ok) {
    return NextResponse.json(
      { error: "Could not search Spotify tracks." },
      { status: 500 }
    );
  }

  const spotifyData = await spotifyResponse.json();
  const tracks = spotifyData.tracks.items;

  const artistTracks = tracks.filter((track: any) =>
    track.artists.some(
      (trackArtist: any) => trackArtist.id === artist.id
    )
  );

  const trackResults = artistTracks.map((track: any) => ({
    name: track.name,
    artist: track.artists[0]?.name ?? "Unknown artist",
    album: track.album.name,
    albumImage: track.album.images[0]?.url ?? "",
    spotifyURL: track.external_urls.spotify,
  }));

  return NextResponse.json({
    artist: {
      id: artist.id,
      name: artist.name,
      image: artist.images?.[0]?.url ?? "",
      genres: artist.genres ?? [],
      spotifyURL: artist.external_urls?.spotify ?? "",
    },
    tracks: trackResults,
  });
}