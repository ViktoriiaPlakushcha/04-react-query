import { useState, useEffect } from "react";
import SearchBar from "../SearchBar/SearchBar";
import fetchMovies from "../../services/movieService";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import ReactPaginate from "react-paginate";
import { type Movie } from "../../types/movie";
import { toast, Toaster } from "react-hot-toast";
import css from "./App.module.css";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

function App() {
  const [query, setQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setPage] = useState(1);

  const handleSearch = (query: string) => {
    setQuery(query);
    setPage(1);
  };

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["movies", query, currentPage],
    queryFn: () => fetchMovies(query, currentPage),
    enabled: query !== "",
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isSuccess) {
      if (data.results.length === 0) {
        toast.error("No movies found for your request.");
        return;
      }
    }
  }, [data, isSuccess]);

  const handleSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };
  const handleClose = () => {
    setSelectedMovie(null);
    setIsModalOpen(false);
    document.body.style.overflow = "";
  };

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />
      <Toaster position="top-center" />
      {isSuccess && data.total_pages !== 0 && data.total_pages > 1 && (
        <ReactPaginate
          pageCount={data.total_pages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={currentPage - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {isError && <ErrorMessage />}
      {isLoading && <Loader />}
      {isSuccess && data.results.length > 0 && (
        <MovieGrid movies={data.results} onSelect={handleSelect} />
      )}
      {isModalOpen && selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleClose} />
      )}
    </div>
  );
}

export default App;
