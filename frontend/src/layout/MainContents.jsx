import { Route, Routes, useLocation } from "react-router-dom";

import ApplicationModal from "../components/application/ApplicationModal";
import ApprovalModal from "../components/approval/ApprovalModal";
import LoanBookModal from "../components/book/LoanBookModal";
import RegisterBookModal from "../components/book/RegisterBookModal";
import {
  default as EditBookModal,
  default as UpdateBookModal,
} from "../components/book/UpdateBookModal";
import EditUserModal from "../components/user/EditUserModal";
import UserModal from "../components/user/UserModal";
import ApplicationPage from "../pages/ApplicationPage";
import ApprovalPage from "../pages/ApprovalPage";
import BookshelfPage from "../pages/BookshelfPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import HomePage from "../pages/HomePage";
import LoanBookPage from "../pages/LoanBookPage";
import ManageBookPage from "../pages/ManageBookPage";
import ManageUserPage from "../pages/ManageUserPage";
import Mypage from "../pages/MyPage";
import NotFoundPage from "../pages/NotFoundPage";
import OpenSearchPage from "../pages/OpenSearchPage";
import RegisterBookPage from "../pages/RegisterBookPage";
import RegisterUserPage from "../pages/RegisterUserPage";
import ResendVerificationPage from "../pages/ResendVerificationPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import UpdateBookPage from "../pages/UpdateBookPage";
import UpdateUserPage from "../pages/UpdateUserPage";
import VerificationPage from "../pages/VerifiyEmailPage";
import styles from "./MainContents.module.css";
import ProtectedRoute from "./ProtectedRoute";

const MainContents = () => {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation ?? null;

  return (
    <main className={styles.root}>
      <Routes location={backgroundLocation || location}>
        <Route index element={<HomePage />} />
        <Route path="/bookshelf" element={<BookshelfPage />} />
        <Route path="/bookshelf/:id" element={<LoanBookModal />} />
        <Route
          path="/bookshelf/loan/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "approver", "general"]}>
              <LoanBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/application"
          element={
            <ProtectedRoute allowedRoles={["admin", "approver", "general"]}>
              <ApplicationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/application/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "approver", "general"]}>
              <ApplicationModal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approval"
          element={
            <ProtectedRoute allowedRoles={["admin", "approver"]}>
              <ApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approval/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "approver"]}>
              <ApprovalModal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/user"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/user/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserModal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/user/register"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RegisterUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/user/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UpdateUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/book"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/book/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UpdateBookModal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/book/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UpdateBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/opensearch"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <OpenSearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/opensearch/:isbn"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RegisterBookModal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/book/register"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RegisterBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/book/register/:isbn"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RegisterBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-page"
          element={
            <ProtectedRoute allowedRoles={["admin", "approver", "general"]}>
              <Mypage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-page/edit/:type"
          element={
            <ProtectedRoute allowedRoles={["admin", "approver", "general"]}>
              <EditUserModal />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerificationPage />} />
        <Route
          path="/resend-verification"
          element={<ResendVerificationPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route path="/bookshelf/:id" element={<LoanBookModal />} />
          <Route
            path="/application/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "approver", "general"]}>
                <ApplicationModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "approver"]}>
                <ApprovalModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/user/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/book/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditBookModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/opensearch/:isbn"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <RegisterBookModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/user/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserModal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-page/edit/:type"
            element={
              <ProtectedRoute allowedRoles={["admin", "approver", "general"]}>
                <EditUserModal />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </main>
  );
};

export default MainContents;
