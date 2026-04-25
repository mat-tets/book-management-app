import { useLocation, useParams } from "react-router-dom";

import useSWR from "swr";

import { retrieveBooks } from "../../api/book";
import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import Loading from "../../layout/Loading";
import NotFoundPage from "../../pages/NotFoundPage";
import Button from "../button/Button";
import ImageModal from "../modal/ImageModal";
import BookDetail from "./BookDetail";
import BookImage from "./BookImage";

const LoanBookModal = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  // state.book がない場合、データベースから再取得
  const stateBook = location.state?.book ?? null;
  const swrKey = stateBook ? null : ["retrieveBooks", id];
  const { data, isLoading } = useSWR(swrKey, ([, id]) => retrieveBooks({ id }));
  const fetchedBook = data?.data?.books[0] ?? null;

  // stateBook または fetchedBook または null
  const sourceBook = stateBook ?? fetchedBook ?? null;

  if (!sourceBook) return <NotFoundPage />;

  if (isLoading) return <Loading />;

  const handleLoanClick = () => {
    navigateVT(`/bookshelf/loan/${id}`, {
      state: { sourceBook, from: location },
    });
  };

  const buttons = [
    <Button
      variant="primary"
      onClick={handleLoanClick}
      disabled={sourceBook.available === 0}
    >
      書籍を借りる
    </Button>,
  ];

  return (
    <>
      <ImageModal
        image={
          <BookImage title={sourceBook.title} coverUrl={sourceBook.coverUrl} />
        }
        buttons={buttons}
      >
        <BookDetail
          book={sourceBook}
          opt={{
            title: true,
            authors: true,
            edition: true,
            publisherName: true,
            publishDate: true,
            genreName: true,
            isbn: true,
            pages: true,
            loanCount: true,
            available: true,
          }}
        />
      </ImageModal>
    </>
  );
};

export default LoanBookModal;
