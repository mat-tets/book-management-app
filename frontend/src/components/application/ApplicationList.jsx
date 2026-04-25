import { useLocation } from "react-router-dom";

import useNavigateWithViewTransition from "../../hooks/useNavigateWithViewTransition";
import BookImage from "../book/BookImage";
import ApplicationDetail from "./ApplicationDetail";
import styles from "./ApplicationList.module.css";

const ApplicationList = ({ applications }) => {
  const location = useLocation();
  const navigateVT = useNavigateWithViewTransition();

  // 申請を押下すると、モーダル表示
  const navigateApplicationModal = (application) => {
    navigateVT(`/application/${application.id}`, {
      state: { application, backgroundLocation: location },
    });
  };

  if (!applications) return;

  if (applications.length === 0) return <h3>申請はありません。</h3>;

  return (
    <ul className={styles.root}>
      {applications.map((application) => (
        <li
          key={application.id}
          className={styles.list}
          onClick={() => navigateApplicationModal(application)}
        >
          <div className={styles.image}>
            <BookImage
              title={application.title}
              coverUrl={application.coverUrl}
            />
          </div>
          <div className={styles.main}>
            <ApplicationDetail
              application={application}
              opt={{
                title: true,
                authors: true,
                requestedAt: true,
                approverName: true,
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

export default ApplicationList;
