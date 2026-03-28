import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import useSWR from "swr";

import { retrieveApplications, updateApplication } from "../../api/loan";
import useAuth from "../../hooks/useAuth";
import useConfirm from "../../hooks/useConfirm";
import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import Loading from "../../layout/Loading";
import NotFoundPage from "../../pages/NotFoundPage";
import BookImage from "../book/BookImage";
import ConfirmButton from "../button/ConfirmButton";
import ImageModal from "../modal/ImageModal";
import ApplicationDetail from "./ApplicationDetail";

const ApplicationModal = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  const { token } = useAuth();
  const { confirm } = useConfirm();

  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // state.application がない場合、データベースから再取得
  const stateApplication = location.state?.application ?? null;
  const swrKey = stateApplication ? null : ["retrieveApplications", id];
  const { data, isLoading } = useSWR(swrKey, ([, id]) =>
    retrieveApplications({ id }, token),
  );
  const fetchedApplication = data?.data?.applications[0] ?? null;

  // stateApplication または fetchedApplication または null
  const sourceApplication = stateApplication ?? fetchedApplication ?? null;

  if (!sourceApplication) return <NotFoundPage />;

  if (isLoading || isUpdateLoading) return <Loading />;

  const handleReturnClick = async () => {
    try {
      setIsUpdateLoading(true);
      const result = await updateApplication(
        id,
        { status: "return_pending" },
        token,
      );
      if (!result.success) {
        await confirm({
          title: "書籍の返却",
          message: [result.message],
          confirmLabel: "OK",
          chacelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "書籍の返却",
        message: [result.message],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/application?status=return_pending");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "書籍の返却",
        message: ["エラーが発生しました", "管理者に問い合わせしてください"],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "danger",
      });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleRejectClick = async () => {
    try {
      setIsUpdateLoading(true);
      const result = await updateApplication(id, { status: "rejected" }, token);
      if (!result.success) {
        await confirm({
          title: "貸出申請の取り消し",
          message: [result.message],
          confirmLabel: "OK",
          chacelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "貸出申請の取り消し",
        message: [result.message],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/application?status=rejected");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "貸出申請の取り消し",
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
    sourceApplication.status === "approved" && (
      <ConfirmButton
        confirmTitle="書籍の返却"
        confirmMessage={[
          "書籍を返却します。書籍は手元にありますか？",
          `書籍名: ${sourceApplication.title}`,
        ]}
        confirmLabel="返却"
        onClick={handleReturnClick}
        variant="primary"
      >
        書籍を返却する
      </ConfirmButton>
    ),
    sourceApplication.status === "pending" && (
      <ConfirmButton
        confirmTitle="貸出申請の取り消し"
        confirmMessage={["申請を取り消しますか？"]}
        onClick={handleRejectClick}
        variant="danger"
      >
        申請を取り消す
      </ConfirmButton>
    ),
  ];

  return (
    <ImageModal
      image={
        <BookImage
          title={sourceApplication.title}
          coverUrl={sourceApplication.coverUrl}
        />
      }
      buttons={buttons}
    >
      <ApplicationDetail
        application={sourceApplication}
        opt={{
          header: true,
          requestedAt: true,
          approverName: true,
          loanStartAt: true,
          loanEndAt: true,
          returnedAt: true,
          status: true,
        }}
      />
    </ImageModal>
  );
};

export default ApplicationModal;
