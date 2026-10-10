import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const artistName = request.nextUrl.searchParams.get("artist");
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

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

  const spotifyResponse = await fetch (
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        artistName ?? ""
    )}&type=track&limit=3&market=AU`,
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

   const trackResults = tracks.map((track: any) => ({
    name: track.name,
    artist: track.artists[0]?.name ?? "Unkown artist",
    album: track.album.name,
    spotifyURL: track.external_urls.spotify,
   }));

   return NextResponse.json({
    tracks: trackResults,
  });
}