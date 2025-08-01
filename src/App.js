import {  useEffect, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY ="b3a11912"


export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);



  // useEffect(() => {
  //   console.log('After initial render');
    
  // },[])

  // useEffect(() => {
  //   console.log('after every render');
    
  // })

  // useEffect(() => {
  //   console.log('D');
    
  // },[query])

  // console.log('during render');
  function handleSelectMovie(id) {
    setSelectedId(selectedId => id === selectedId ? null : id);
  }
  function handleCloseMovie(id) {
    setSelectedId(null);
  }
  useEffect(function(){
    const controller = new AbortController();
    async function fetchMovies() {

      try  {
        setIsLoading(true);
        setError('')
        const res = await fetch(
          `https://www.omdbapi.com/?s=${query}&apikey=${KEY}`,
          {
            signal: controller.signal
          }
        );
      

        if (!res.ok) {
          throw new Error("Something went wrong with fetching the movies");
          
        }
        const data = await res.json();

        

        if(data.Response === "False") {
          throw new Error("movie not found");
        }
        setMovies(data.Search)
        setIsLoading(false);
      }
    
      catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        
        }
      }
      finally {
        setIsLoading(false);
       
      }
    }
    if (!query.length) {
      setMovies([])
      setError("");
      return;
    }
    fetchMovies();
    return () => {
      controller.abort();
    };
    
  }, [query]);


  return (
    <>
      <NavBar>
      
        <Logo />
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies}/>
      </NavBar>
      <Main>   
        <Box movies={movies}>
          {/* {isLoading ? <Loader /> :<MovieList movies={movies} />} */}

          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          
          { 
            selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} /> :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          } 
        </Box>
      </Main>
      
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>
  }
function ErrorMessage({message}) {
  return <p className="error">
    <span>⛔</span> {message}</p>
}
function NavBar({children}) { 

    return (
      <nav className="nav-bar">
        {children}
      
    </nav>
  );
} 
function Logo(){
  return (
      <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
      </div>
  );
}
function Search({query, setQuery}) {


  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function NumResults({movies }) {
  return (
    <p className="num-results">
        Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Main({children }) {
  return (
    <main className="main">

      {children}
    </main>
  )
}



function MovieList({movies,onSelectMovie }) {

  return(
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
      ))}
    </ul>
  )
}
function Movie({movie,onSelectMovie}) {
  return (  
    <li onClick={()=>onSelectMovie(movie.imdbID)}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓️</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
  );
}
function Box({children }) {
  const [isOpen, setIsOpen] = useState(true);
  return(
    <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && (
            children
          )}
        </div>

  )
}
function MovieDetails({selectedId,onCloseMovie}){
  const [movie,setMovie]= useState({});
  const [isLoading, setIsLoading] = useState(false);
  const{ Title : title,
     Poster:poster,
     Year:year ,
     imdbRating, 
     Plot:plot,
     Runtime:runtime,
     Released:released,
     Actors:actors,
     Director:director,
     Genre:genre 
    } = movie;

    
useEffect(function(){
  async function getMovieDetails(){
    setIsLoading(true);
    const res = await fetch(
    `https://www.omdbapi.com/?i=${selectedId}&apikey=${KEY}`
    );
    const data = await res.json()
    setMovie(data);
    setIsLoading(false);

  }
  getMovieDetails();
},[selectedId])

  return(
    <div className="details">
      {isLoading ?  <Loader /> :
      <>
        <header>
        <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
        <img src={poster} alt={`${title} poster`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>{released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐️</span>
            <span>{imdbRating} IMDB rating</span>
          </p>
        </div>
        </header>

        <section>
          <div className="rating">
            <StarRating maxRating={10} size={24}/>
          </div>
          <p><em>{plot}</em></p>
          <p>Starring: {actors}</p>
          <p>Directed by: {director}</p>
          <p>Genre: {genre}</p>

        </section> 
      </>
      }

    </div>
  )
}
function WatchedSummary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return(
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMoviesList({watched}) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID}  />
      ))}
    </ul>
  );
}
function WatchedMovie({movie}) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}