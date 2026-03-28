import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import useSWR from "swr";

import { deleteBook, retrieveBooks } from "../../api/book";
import useAuth from "../../hooks/useAuth";
import useConfirm from "../../hooks/useConfirm";
import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import Loading from "../../layout/Loading";
import Button from "../button/Button";
import ConfirmButton from "../button/ConfirmButton";
import ImageModal from "../modal/ImageModal";
import BookDetail from "./BookDetail";
import BookImage from "./BookImage";

const UpdateBookModal = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  const { token } = useAuth();
  const { confirm } = useConfirm();

  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // state.book がない場合、データベースから再取得
  const stateBook = location.state?.book ?? null;
  const swrKey = stateBook ? null : ["retrieveBooks", id];
  const { data, isLoading } = useSWR(swrKey, ([, id]) => retrieveBooks({ id }));
  const fetchedBook = data?.data?.books[0] ?? null;

  // stateBook または fetchedBook または null
  const sourceBook = stateBook ?? fetchedBook ?? null;

  if (!sourceBook) return <NotFoundPage />;

  if (isLoading || isUpdateLoading) return <Loading />;

  const handleEditClick = () => {
    navigateVT(`/manage/book/edit/${id}`, {
      state: { sourceBook, from: location },
    });
  };

  const handleDeleteClick = async () => {
    try {
      const isRequired = await confirm({
        title: "削除の確認",
        message: ["この操作は取り消せません"],
        confirmLabel: "削除",
        chacelLabel: "キャンセル",
        variant: "danger",
        requiredText: "削除",
        inputPlaceholder: "削除",
      });
      if (!isRequired) {
        return;
      }
      setIsUpdateLoading(true);
      const result = await deleteBook(id, token);
      if (!result.success) {
        await confirm({
          title: "書籍の削除",
          message: [result.message],
          confirmLabel: "OK",
          chacelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "書籍の削除",
        message: [result.message],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/manage/book");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "書籍の削除",
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const buttons = [
    <Button
      variant="primary"
      onClick={handleEditClick}
      disabled={sourceBook.stockCount !== sourceBook.available}
    >
      書籍を編集する
    </Button>,
    <ConfirmButton
      confirmTitle="書籍の削除"
      confirmMessage={[
        "書籍を削除しますか？",
        "特別な理由がない限り、在庫数を0にすることをおすすめします",
      ]}
      confirmLabel="削除する"
      cancelLabel="キャンセル"
      variant="danger"
      onClick={handleDeleteClick}
      disabled={sourceBook.stockCount !== sourceBook.available}
    >
      書籍を削除する
    </ConfirmButton>,
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
            loanCount: true,
            available: true,
          }}
        />
      </ImageModal>
    </>
  );
};

export default UpdateBookModal;
