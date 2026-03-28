import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { isEqual } from "lodash";
import useSWR from "swr";

import { retrieveBooks, updateBook, updateImage } from "../api/book";
import EditBook from "../components/book/EditBook";
import useAuth from "../hooks/useAuth";
import useConfirm from "../hooks/useConfirm";
import Loading from "../layout/Loading";
import NotFoundPage from "./NotFoundPage";

const toDraft = (book) => ({
  title: book.title ?? "",
  titleTranscription: book.titleTranscription ?? "",
  authors: (book.authors ?? []).map((author) => ({
    name: author.name ?? "",
    nameTranscription: author.nameTranscription ?? "",
  })),
  edition: book.edition ?? "",
  publisherName: book.publisherName ?? "",
  publishDate: book.publishDate ?? "",
  pages: book.pages ?? 0,
  genreName: book.genreName ?? "",
  isbn: book.isbn ?? "",
  stockCount: book.stockCount ?? 0,
  coverUrl: book.coverUrl ?? "",
  coverFile: null,
});

const normAuthors = (authors = []) =>
  authors.map((author) => ({
    name: (author.name ?? "").trim(),
    nameTranscription: (author.nameTranscription ?? "").trim(),
  }));

const normDraftForCompare = (d) => ({
  title: (d?.title ?? "").trim(),
  titleTranscription: d?.titleTranscription ?? "",
  edition: d?.edition ?? "",
  publisherName: d?.publisherName ?? "",
  publishDate: d?.publishDate ?? "",
  pages: Number(d?.pages ?? 0),
  genreName: d?.genreName ?? "",
  isbn: d?.isbn ?? "",
  stockCount: Number(d?.stockCount ?? 0),
  coverUrl: d?.coverUrl ?? "",
  authors: normAuthors(d?.authors ?? []),
});

const UpdateBookPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { token } = useAuth();
  const { confirm } = useConfirm();

  const [draft, setDraft] = useState(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // state.book がない場合、データベースから再取得
  const stateBook = location.state?.book ?? null;
  const swrKey = stateBook ? null : ["retrieveBooks", id];
  const { data, isLoading } = useSWR(swrKey, ([, id]) => retrieveBooks({ id }));
  const fetchedBook = data?.data?.books[0] ?? null;

  // stateBook または fetchedBook または null
  const sourceBook = stateBook ?? fetchedBook ?? null;

  const initialDraft = useMemo(() => {
    if (!sourceBook) return;
    return toDraft(sourceBook);
  }, [sourceBook]);

  // draft 初期化
  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  if (!sourceBook) return <NotFoundPage />;

  if (isLoading || isUpdateLoading || !draft) return <Loading />;

  const isDirty = !isEqual(
    normDraftForCompare(initialDraft),
    normDraftForCompare(draft),
  );

  const handleUpdateClick = async () => {
    const payload = {
      title: draft.title.trim(),
      titleTranscription: draft.titleTranscription,
      edition: draft.edition,
      publisherName: draft.publisherName,
      publishDate: draft.publishDate,
      pages: draft.pages,
      genreName: draft.genreName,
      isbn: draft.isbn,
      stockCount: draft.stockCount,
      authors: draft.authors.map((author) => ({
        name: author.name,
        nameTranscription: author.nameTranscription,
      })),
    };

    try {
      setIsUpdateLoading(true);
      const result = await updateBook(sourceBook.id, payload, token);
      if (!result.success) {
        await confirm({
          title: "書籍情報の更新",
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      if (draft.coverFile) {
        const formData = new FormData();
        formData.append("cover", draft.coverFile);
        const imageResult = await updateImage(sourceBook.id, formData, token);
        if (!imageResult.success) {
          await confirm({
            title: "書籍情報の更新",
            message: [imageResult.message],
            confirmLabel: "OK",
            cancelLabel: "閉じる",
            variant: "danger",
          });
          return;
        }
      }
      await confirm({
        title: "書籍情報の更新",
        message: [result.message],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
        variant: "primary",
      });
      navigate("/manage/book");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "書籍情報の更新",
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleResetClick = () => {
    setDraft({
      ...initialDraft,
      authors: (initialDraft.authors ?? []).map((a) => ({
        ...a,
      })),
      coverFile: null,
    });
  };

  return (
    <EditBook
      draft={draft}
      setDraft={setDraft}
      updateText="書籍情報の更新"
      onUpdate={handleUpdateClick}
      onReset={handleResetClick}
      isDirty={isDirty}
    />
  );
};

export default UpdateBookPage;
