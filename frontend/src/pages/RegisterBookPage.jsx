import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { isEqual } from "lodash";
import useSWR from "swr";

import { registerBook, updateImage } from "../api/book";
import { fetchOpensearch } from "../api/opensearch";
import EditBook from "../components/book/EditBook";
import useAuth from "../hooks/useAuth";
import useConfirm from "../hooks/useConfirm";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";

const createEmptyDraft = () => ({
  title: "",
  titleTranscription: "",
  authors: [
    {
      name: "",
      nameTranscription: "",
    },
  ],
  edition: "",
  publisherName: "",
  publishDate: "",
  pages: 0,
  genreName: "",
  isbn: "",
  stockCount: 0,
  coverUrl: "",
  coverFile: null,
});

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

const RegisterBookPage = () => {
  const { isbn } = useParams();
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  const { token } = useAuth();
  const { confirm } = useConfirm();

  const [draft, setDraft] = useState(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // state.book がなく、isbn がパラメータとしてある場合は国会国立図書館からデータ取得
  const stateBook = location.state?.book ?? null;
  const swrKey = stateBook ? null : isbn ? ["fetchOpensearch", isbn] : null;
  const { data, isLoading, error } = useSWR(swrKey, ([, isbn]) =>
    fetchOpensearch({ search: isbn }),
  );
  const fetchedBook = data?.data?.books?.[0] ?? null;

  // stateBook または fetchedBook (国会国立図書館のデータ) または null
  const sourceBook = stateBook ?? fetchedBook ?? null;

  const initialDraft = useMemo(() => {
    return sourceBook ? toDraft(sourceBook) : createEmptyDraft();
  }, [sourceBook]);

  // draft 初期化
  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  if (isLoading || isUpdateLoading || !draft) return <Loading />;

  // isbnあるのに見つからなかった場合
  const notFound = !!isbn && !stateBook && !fetchedBook && !isLoading && !error;
  if (notFound) {
    return (
      <div>
        <p>ISBN「{isbn}」の書籍が見つかりませんでした。</p>
        <button
          onClick={() => navigateVT("/manage/book/register", { replace: true })}
        >
          手動で登録する
        </button>
      </div>
    );
  }

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
      authors: (draft.authors ?? []).map((author) => ({
        name: author.name,
        nameTranscription: author.nameTranscription,
      })),
    };

    try {
      setIsUpdateLoading(true);
      const result = await registerBook(payload, token);
      if (!result.success) {
        await confirm({
          title: "書籍情報の登録",
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }

      // 画像更新の分岐（元のまま）
      if (draft.coverFile) {
        const formData = new FormData();
        formData.append("cover", draft.coverFile);
        const imageResult = await updateImage(
          result.data.bookId,
          formData,
          token,
        );
        if (!imageResult.success) {
          await confirm({
            title: "書籍情報の登録",
            message: [imageResult.message],
            confirmLabel: "OK",
            cancelLabel: "閉じる",
            variant: "danger",
          });
          return;
        }
      } else if (draft.coverUrl) {
        const imageResult = await updateImage(
          result.data.bookId,
          JSON.stringify({ coverUrl: draft.coverUrl }),
          token,
        );
        if (!imageResult.success) {
          await confirm({
            title: "書籍情報の登録",
            message: [imageResult.message],
            confirmLabel: "OK",
            cancelLabel: "閉じる",
            variant: "danger",
          });
          return;
        }
      }
      await confirm({
        title: "書籍情報の登録",
        message: [result.message],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/manage/book");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "書籍情報の登録",
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
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
      updateText="書籍の追加"
      onUpdate={handleUpdateClick}
      onReset={handleResetClick}
      isDirty={isDirty}
    />
  );
};

export default RegisterBookPage;
