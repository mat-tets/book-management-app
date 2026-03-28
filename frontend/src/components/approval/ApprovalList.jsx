import { useLocation } from "react-router-dom";

import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import BookImage from "../book/BookImage";
import ApprovalDetail from "./ApprovalDetail";
import styles from "./ApprovalList.module.css";

const ApprovalList = ({ approvals }) => {
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  // 承認を押下すると、モーダル表示
  const navigateApprovalModal = (approval) => {
    navigateVT(`/approval/${approval.id}`, {
      state: { approval, backgroundLocation: location },
    });
  };

  if (!approvals) return;

  if (approvals.length === 0) return <h3>申請はありません。</h3>;

  return (
    <ul className={styles.root}>
      {approvals.map((approval) => (
        <li
          key={approval.id}
          className={styles.list}
          onClick={() => navigateApprovalModal(approval)}
        >
          <div className={styles.image}>
            <BookImage title={approval.title} coverUrl={approval.coverUrl} />
          </div>
          <div className={styles.main}>
            <ApprovalDetail
              approval={approval}
              opt={{
                header: true,
                requestedAt: true,
                userName: true,
                loanStartAt: true,
                loanEndAt: true,
                returnedAt: true,
                status: true,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ApprovalList;
