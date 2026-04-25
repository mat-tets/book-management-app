import styles from "./ApplicationDetail.module.css";

const statusMap = {
  pending: "貸出申請中",
  approved: "貸出中",
  return_pending: "返却申請中",
  returned: "返却済",
  rejected: "棄却",
};

const ApplicationDetail = ({ application, opt = {} }) => {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        {(opt.header || opt.titleTranscription) && (
          <p className={styles.titleTranscription}>
            {application.titleTranscription || "-"}
          </p>
        )}
        {(opt.header || opt.title) && (
          <h2 className={styles.title}>{application.title || "-"}</h2>
        )}
        {(opt.header || opt.authors) && (
          <div className={styles.author}>
            {application.authors
              ? application.authors.map((author) => (
                  <p key={author.id}>{author.name}</p>
                ))
              : "-"}
            <span>(著)</span>
          </div>
        )}
      </header>
      <div className={styles.detail}>
        {opt.requestedAt && (
          <div className={styles.field}>
            <label>申請日</label>
            <div className={styles.readonly}>
              {application.requestedAt || "-"}
            </div>
          </div>
        )}
        {opt.approverName && (
          <div className={styles.field}>
            <label>承認者</label>
            <div className={styles.readonly}>
              {application.approverName || "-"}
            </div>
          </div>
        )}
        {opt.loanStartAt && (
          <div className={styles.field}>
            <label>承認日</label>
            <div className={styles.readonly}>
              {application.loanStartAt || "-"}
            </div>
          </div>
        )}
        {opt.loanEndAt && (
          <div className={styles.field}>
            <label>返却予定日</label>
            <div className={styles.readonly}>
              {application.loanEndAt || "-"}
            </div>
          </div>
        )}
        {opt.returnedAt && (
          <div className={styles.field}>
            <label>返却日</label>
            <div className={styles.readonly}>
              {application.returnedAt || "-"}
            </div>
          </div>
        )}
        {opt.status && (
          <div className={styles.field}>
            <label>ステータス</label>
            <div className={styles.readonly}>
              {statusMap[application.status]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetail;
