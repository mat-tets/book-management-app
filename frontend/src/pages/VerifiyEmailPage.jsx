import { useSearchParams } from "react-router-dom";

import useSWR from "swr";

import { verifyEmail } from "../api/auth";
import Button from "../components/button/Button";
import useNavigateWithViewTransition from "../hooks/useNavigateWithViewTransition";
import Loading from "../layout/Loading";
import NotFoundPage from "./NotFoundPage";
import styles from "./VerifyEmailPage.module.css";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigateVT = useNavigateWithViewTransition();

  const { data, isLoading } = useSWR(
    token ? ["verifyEmail", token] : null,
    ([, token]) => verifyEmail({ token }),
    { revalidateOnFocus: false },
  );

  if (!token) return <NotFoundPage />;

  if (isLoading) return <Loading />;

  const handleNavigateClick = () => {
    navigateVT("/signin", { replace: true });
  };

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        {data?.message}
        <div className={styles.actions}>
          <Button onClick={handleNavigateClick} variant="primary">
            {data?.success ? "サインイン" : "戻る"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
