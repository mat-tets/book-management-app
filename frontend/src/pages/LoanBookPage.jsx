import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import useSWR from "swr";

import { retrieveBooks } from "../api/book";
import { registerApplication } from "../api/loan";
import { retrieveUsers } from "../api/user";
import BookImage from "../components/book/BookImage";
import Button from "../components/button/Button";
import ConfirmButton from "../components/button/ConfirmButton";
import useAuth from "../hooks/useAuth";
import useConfirm from "../hooks/useConfirm";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import styles from "./LoanBookPage.module.css";
import NotFoundPage from "./NotFoundPage";

const LoanBookPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();
  const [approverId, setApproverId] = useState("");

  const { token } = useAuth();
  const { confirm } = useConfirm();

  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // state.book がない場合、データベースから再取得
  const stateBook = location.state?.book ?? null;
  const swrKey = stateBook ? null : ["retrieveBooks", id];
  const { data: bookData, isLoading: isBookLoading } = useSWR(
    swrKey,
    ([, id]) => retrieveBooks({ id }),
  );
  const fetchedBook = bookData?.data?.books[0] ?? null;

  // stateBook または fetchedBook または null
  const sourceBook = stateBook ?? fetchedBook ?? null;

  // 承認者の取得
  const { data: approverData, isLoading: isApproverLoading } = useSWR(
    ["retrieveUsers", "role=admin&role=approver"],
    ([, searchParams]) => retrieveUsers(searchParams, token),
  );
  const approvers = approverData?.data?.users ?? null;

  if (!sourceBook) return <NotFoundPage />;

  if (isBookLoading || isApproverLoading || isRegisterLoading)
    return <Loading />;

  const handleLoanClick = async () => {
    try {
      setIsRegisterLoading(true);
      const result = await registerApplication(
        {
          bookId: sourceBook.id,
          approverId,
        },
        token,
      );
      if (!result.success) {
        await confirm({
          title: "貸出申請",
          message: [result.message],
          confirmLabel: "OK",
          chacelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "貸出申請",
        message: [result.message],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/application?status=pending");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "貸出申請",
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const closeButton = {
    label: "キャンセル",
    onClick: () => navigateVT(-1),
    type: "button",
    variant: "secondary",
    disabled: false,
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Loan Book Page</p>
        <h2 className={styles.title}>貸出申請</h2>
        <p className={styles.sub}>
          申請前に内容を確認し、承認者を選択してください。
        </p>
      </header>

      <div className={styles.content}>
        <aside className={styles.coverPanel}>
          <div className={styles.coverCard}>
            <div className={styles.coverImage}>
              <BookImage
                title={sourceBook.title}
                coverUrl={sourceBook.coverUrl}
              />
            </div>
            <div className={styles.coverMeta}>
              <p className={styles.coverTitle}>
                {sourceBook.title || "タイトル未設定"}
              </p>
              <p className={styles.coverSubtitle}>
                {sourceBook.publisherName || "出版社未設定"}
              </p>
            </div>
          </div>

          <div className={styles.noticeCard}>
            <p className={styles.noticeTitle}>注意</p>
            <p className={styles.noticeText}>
              貸出期間は承認日を含め2週間です。
            </p>
          </div>
        </aside>

        <section className={styles.formCard}>
          <div>
            <p className={styles.eyebrow}>Detail</p>
            <h2>申請内容</h2>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label>書籍名</label>
              <div className={styles.readonly}>{sourceBook.title || "-"}</div>
            </div>
            <div className={styles.field}>
              <label htmlFor="approverSelect">承認者</label>
              <select
                id="approverSelect"
                className={styles.select}
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
              >
                <option value="">承認者を選択してください</option>
                {approvers.map((approver) => (
                  <option key={approver.id} value={approver.id}>
                    {approver.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <ConfirmButton
              onClick={handleLoanClick}
              confirmTitle="貸出申請"
              confirmMessage={[
                "書籍、承認者は後から変更できません",
                "申請してよろしいですか？",
              ]}
              confirmLabel="申請する"
              cancelLabel="キャンセル"
              variant="primary"
              disabled={!approverId}
            >
              申請する
            </ConfirmButton>
            <Button
              key={closeButton.label}
              onClick={closeButton.onClick}
              variant={closeButton.variant}
              type={closeButton.type}
              disabled={closeButton.disabled}
            >
              {closeButton.label}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoanBookPage;
