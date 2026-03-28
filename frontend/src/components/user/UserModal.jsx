import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import useSWR from "swr";

import { deleteUser, retrieveUsers } from "../../api/user";
import useAuth from "../../hooks/useAuth";
import useConfirm from "../../hooks/useConfirm";
import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import Loading from "../../layout/Loading";
import NotFoundPage from "../../pages/NotFoundPage";
import Button from "../button/Button";
import ConfirmButton from "../button/ConfirmButton";
import ImageModal from "../modal/ImageModal";
import UserDetail from "./UserDetail";
import UserImage from "./UserImage";

const UserModal = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  const { token } = useAuth();
  const { confirm } = useConfirm();

  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // state.user がない場合、データベースから再取得
  const stateUser = location.state?.user ?? null;
  const swrKey = stateUser ? null : ["retrieveUsers", id];
  const { data, isLoading } = useSWR(swrKey, ([, id]) =>
    retrieveUsers({ id }, token),
  );
  const fetchedUser = data?.data?.users[0] ?? null;

  // stateApplication または fetchedApplication または null
  const sourceUser = stateUser ?? fetchedUser ?? null;

  if (!sourceUser) return <NotFoundPage />;

  if (isLoading || isUpdateLoading) return <Loading />;

  const handleEditClick = () => {
    navigateVT(`/manage/user/edit/${id}`, {
      state: { sourceUser, from: location },
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
      const result = await deleteUser(id, token);
      if (!result.success) {
        await confirm({
          title: "ユーザの削除",
          message: [result.message],
          confirmLabel: "OK",
          chacelLabel: "閉じる",
          variant: "danger",
        });
        return;
      }
      await confirm({
        title: "ユーザの削除",
        message: [result.message],
        confirmLabel: "OK",
        chacelLabel: "閉じる",
        variant: "primary",
      });
      navigateVT("/manage/user");
    } catch (e) {
      console.log(e);
      await confirm({
        title: "ユーザの削除",
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
    <Button variant="primary" onClick={handleEditClick}>
      ユーザを編集する
    </Button>,
    <ConfirmButton
      confirmTitle="ユーザの削除"
      confirmMessage={[
        "ユーザを削除しますか？",
        "特別な理由がない限り、不可ユーザにすることをおすすめします",
      ]}
      confirmLabel="削除する"
      cancelLabel="キャンセル"
      variant="danger"
      onClick={handleDeleteClick}
    >
      ユーザを削除する
    </ConfirmButton>,
  ];

  return (
    <ImageModal image={<UserImage id={sourceUser.id} />} buttons={buttons}>
      <UserDetail
        user={sourceUser}
        opt={{ name: true, email: true, role: true }}
      />
    </ImageModal>
  );
};

export default UserModal;
