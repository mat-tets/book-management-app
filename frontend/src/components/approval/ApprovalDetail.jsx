import styles from "./ApprovalDetail.module.css";

const statusMap = {
  pending: "貸出申請中",
  approved: "貸出中",
  return_pending: "返却申請中",
  returned: "返却済",
  rejected: "棄却",
};

const ApprovalDetail = ({ approval, opt = {} }) => {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        {(opt.header || opt.titleTranscription) && (
          <p className={styles.titleTranscription}>
            {approval.titleTranscription || "-"}
          </p>
        )}
        {(opt.header || opt.title) && (
          <h2 className={styles.title}>{approval.title || "-"}</h2>
        )}
        {(opt.header || opt.authors) && (
          <div className={styles.author}>
            {approval.authors
              ? approval.authors.map((author) => (
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
            <div className={styles.readonly}>{approval.requestedAt || "-"}</div>
          </div>
        )}
        {opt.userName && (
          <div className={styles.field}>
            <label>申請者</label>
            <div className={styles.readonly}>{approval.userName || "-"}</div>
          </div>
        )}
        {opt.loanStartAt && (
          <div className={styles.field}>
            <label>承認日</label>
            <div className={styles.readonly}>{approval.loanStartAt || "-"}</div>
          </div>
        )}
        {opt.loanEndAt && (
          <div className={styles.field}>
            <label>返却予定日</label>
            <div className={styles.readonly}>{approval.loanEndAt || "-"}</div>
          </div>
        )}
        {opt.returnedAt && (
          <div className={styles.field}>
            <label>返却日</label>
            <div className={styles.readonly}>{approval.returnedAt || "-"}</div>
          </div>
        )}
        {opt.status && (
          <div className={styles.field}>
            <label>ステータス</label>
            <div className={styles.readonly}>{statusMap[approval.status]}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalDetail;
