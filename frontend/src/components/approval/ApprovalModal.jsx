import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import useSWR from "swr";

import { retrieveApprovals, updateApproval } from "../../api/loan";
import useAuth from "../../hooks/useAuth";
import useConfirm from "../../hooks/useConfirm";
import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import Loading from "../../layout/Loading";
import BookImage from "../book/BookImage";
import ConfirmButton from "../button/ConfirmButton";
import ImageModal from "../modal/ImageModal";
import ApprovalDetail from "./ApprovalDetail";

const ApprovalModal = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  const { token } = useAuth();
  const { confirm } = useConfirm();

  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // state.approval がない場合、データベースから再取得
  const stateApproval = location.state?.approval ?? null;
  const swrKey = stateApproval ? null : ["retrieveApprovals", id];
  const { data, isLoading } = useSWR(swrKey, ([, id]) =>
    retrieveApprovals({ id }, token),
  );
  const fetchedApproval = data?.data?.approvals[0] ?? null;

  // stateApproval または fetchedApproval または null
  const sourceApproval = stateApproval ?? fetchedApproval ?? null;

  if (!sourceApproval) return <NotFoundPage />;

  if (isLoading || isUpdateLoading) return <Loading />;

  const handleApproveClick = async (status) => {
    try {
      setIsUpdateLoading(true);
      const result = await updateApproval(id, { status }, token);
      if (!result.success) {
        await confirm({
          title: "申請の承認",
          message: [result.message],
          confirmLabel: "OK",
          cancelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "申請の承認",
        message: [result.message],
        confirmLabel: "OK",
        cancelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT(`/approval?status=${status}`);
    } catch (e) {
      console.log(e);
      await confirm({
        title: "申請の承認",
        message: ["エラーが発生しました管理者に問い合わせしてください", e],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const buttons = [
    sourceApproval.status === "pending" && (
      <ConfirmButton
        confirmTitle="申請の承認"
        confirmMessage={[
          "貸出申請を承認しますか？",
          `申請者: ${sourceApproval.userName}`,
          `書籍名: ${sourceApproval.title}`,
        ]}
        confirmLabel="承認する"
        cancelLabel="キャンセル"
        variant="primary"
        onClick={() => handleApproveClick("approved")}
      >
        承認する
      </ConfirmButton>
    ),
    sourceApproval.status === "return_pending" && (
      <ConfirmButton
        confirmTitle="申請の承認"
        confirmMessage={[
          "返却申請を承認します。書籍を受け取りましたか？",
          `申請者: ${sourceApproval.userName}`,
          `書籍名: ${sourceApproval.title}`,
        ]}
        confirmLabel="承認する"
        cancelLabel="キャンセル"
        variant="primary"
        onClick={() => handleApproveClick("returned")}
      >
        承認する
      </ConfirmButton>
    ),
  ];

  return (
    <ImageModal
      image={
        <BookImage
          title={sourceApproval.title}
          coverUrl={sourceApproval.coverUrl}
        />
      }
      buttons={buttons}
    >
      <ApprovalDetail
        approval={sourceApproval}
        opt={{
          title: true,
          authors: true,
          requestedAt: true,
          userName: true,
          loanStartAt: true,
          loanEndAt: true,
          returnedAt: true,
          status: true,
        }}
      />
    </ImageModal>
  );
};

export default ApprovalModal;
