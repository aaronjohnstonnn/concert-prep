# Technical Plan



## Architecture

Browser
↓
Next.js frontend
↓
Next.js API route / backend
↓
Spotify Web API
Apple Music API
Concert/Event API
↓
PostgreSQL database



## Pages

### Home page

- Artist or concert search bar
- Example searches
- Recent searches, if implemented later

### Artist page

- Artist name and image
- Artist genres
- Track list
- Track popularity
- Spotify and Apple Music links
- Filter by artist, once concerts are added

### Concert page

- Concert name
- Date and venue
- City and country
- Artist lineup
- Combined ranked song list



## Data Model

### artists

- id
- spotify_artist_id
- apple_music_artist_id
- name
- image_url
- genres
- popularity

### concerts

- id
- external_event_id
- name
- venue
- city
- country
- starts_at
- ticket_url

### concert_artists

- concert_id
- artist_id
- billing_order

### songs

- id
- artist_id
- spotify_track_id
- apple_music_song_id
- title
- album
- duration_ms
- popularity
- spotify_url
- apple_music_url



## Recommendation algorithm

The first version will use a transparent scoring system:

score =
  popularity score
  + recent-release bonus
  + artist-importance bonus
  - repetition penalty

The system will aim to return a balanced number of songs from each artist in a concert lineup.



## Security

- API keys will be stored in server-side environment variables.
- The browser will never call Spotify, Apple Music, or concert APIs directly using secret keys.
- The backend will validate user input before forwarding requests.
- API errors will return useful, non-sensitive messages to the user.



## Testing

Initial tests will cover:

- Sorting songs by popularity
- Filtering songs by artist
- Recommendation scoring
- Normalising API responses
- Handling empty and invalid search input