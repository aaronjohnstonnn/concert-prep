export default function Home() {
  return (
    <main>
      <section>
        <p>CONCERTPREP</p>

        <h1>Know every word before the first song plays.</h1>

        <p>Search for an artist and discover the best songs to listen to before your next concert.</p>

        <form>
          <label htmlFor="artist-search">Artist Name</label>

          <div>
            <input id="artist-search" type="text" placeholder="Search for an artist, for example: Drake"/>
            <button type="submit">Search</button>
          </div>
        </form>
      </section>
    </main>
  )
}