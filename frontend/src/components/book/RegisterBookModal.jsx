import { useLocation, useParams } from "react-router-dom";

import useSWR from "swr";

import { fetchOpensearch } from "../../api/opensearch";
import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import Loading from "../../layout/Loading";
import NotFoundPage from "../../pages/NotFoundPage";
import Button from "../button/Button";
import ImageModal from "../modal/ImageModal";
import BookDetail from "./BookDetail";
import BookImage from "./BookImage";

const RegisterBookModal = () => {
  const { isbn } = useParams();
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  // state.book がない場合、データベースから再取得
  const stateBook = location.state?.book ?? null;
  const swrKey = stateBook ? null : ["fetchOpensearch", isbn];
  const { data, isLoading } = useSWR(swrKey, ([, isbn]) =>
    fetchOpensearch({ search: isbn }),
  );
  const fetchedBook = data?.data?.books[0] ?? null;

  // stateBook または fetchedBook または null
  const sourceBook = stateBook ?? fetchedBook ?? null;

  if (!sourceBook) return <NotFoundPage />;

  if (isLoading) return <Loading />;

  const handleRegisterClick = () => {
    navigateVT(`/manage/book/register/${isbn}`, {
      state: { sourceBook, from: location },
    });
  };

  const buttons = [
    <Button variant="primary" onClick={handleRegisterClick}>
      書籍を登録
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
            header: true,
            edition: true,
            publisherName: true,
            publishDate: true,
            genreName: true,
            isbn: true,
            pages: true,
          }}
        />
      </ImageModal>
    </>
  );
};

export default RegisterBookModal;
