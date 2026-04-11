import { Route, Routes, useLocation } from "react-router-dom";

import ApplicationModal from "../components/application/ApplicationModal";
import ApprovalModal from "../components/approval/ApprovalModal";
import LoanBookModal from "../components/book/LoanBookModal";
import RegisterBookModal from "../components/book/RegisterBookModal";
import UpdateBookModal from "../components/book/UpdateBookModal";
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

const renderProtectedElement = (element, allowedRoles) => {
  if (!allowedRoles) {
    return element;
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>
  );
};

const renderRoute = (route) => {
  const key = route.index ? "index" : route.path;

  return (
    <Route
      key={key}
      index={route.index}
      path={route.path}
      element={renderProtectedElement(route.element, route.allowedRoles)}
    />
  );
};

const appRoutes = [
  { index: true, element: <HomePage /> },
  { path: "/bookshelf", element: <BookshelfPage /> },
  { path: "/bookshelf/:id", element: <LoanBookModal /> },
  {
    path: "/bookshelf/loan/:id",
    element: <LoanBookPage />,
    allowedRoles: ["admin", "approver", "general"],
  },
  {
    path: "/application",
    element: <ApplicationPage />,
    allowedRoles: ["admin", "approver", "general"],
  },
  {
    path: "/application/:id",
    element: <ApplicationModal />,
    allowedRoles: ["admin", "approver", "general"],
  },
  {
    path: "/approval",
    element: <ApprovalPage />,
    allowedRoles: ["admin", "approver"],
  },
  {
    path: "/approval/:id",
    element: <ApprovalModal />,
    allowedRoles: ["admin", "approver"],
  },
  {
    path: "/manage/user",
    element: <ManageUserPage />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/user/:id",
    element: <UserModal />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/user/register",
    element: <RegisterUserPage />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/user/edit/:id",
    element: <UpdateUserPage />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/book",
    element: <ManageBookPage />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/book/:id",
    element: <UpdateBookModal />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/book/edit/:id",
    element: <UpdateBookPage />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/opensearch",
    element: <OpenSearchPage />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/opensearch/:isbn",
    element: <RegisterBookModal />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/book/register",
    element: <RegisterBookPage />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/book/register/:isbn",
    element: <RegisterBookPage />,
    allowedRoles: ["admin"],
  },
  {
    path: "/my-page",
    element: <Mypage />,
    allowedRoles: ["admin", "approver", "general"],
  },
  {
    path: "/my-page/edit/:type",
    element: <EditUserModal />,
    allowedRoles: ["admin", "approver", "general"],
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/signin", element: <SignInPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/verify-email", element: <VerificationPage /> },
  { path: "/resend-verification", element: <ResendVerificationPage /> },
  { path: "*", element: <NotFoundPage /> },
];

const modalRoutes = [
  { path: "/bookshelf/:id", element: <LoanBookModal /> },
  {
    path: "/application/:id",
    element: <ApplicationModal />,
    allowedRoles: ["admin", "approver", "general"],
  },
  {
    path: "/approval/:id",
    element: <ApprovalModal />,
    allowedRoles: ["admin", "approver"],
  },
  {
    path: "/manage/user/:id",
    element: <UserModal />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/book/:id",
    element: <UpdateBookModal />,
    allowedRoles: ["admin"],
  },
  {
    path: "/manage/opensearch/:isbn",
    element: <RegisterBookModal />,
    allowedRoles: ["admin"],
  },
  {
    path: "/my-page/edit/:type",
    element: <EditUserModal />,
    allowedRoles: ["admin", "approver", "general"],
  },
];

const MainContents = () => {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation ?? null;

  return (
    <main className={styles.root}>
      <Routes location={backgroundLocation || location}>
        {appRoutes.map(renderRoute)}
      </Routes>
      {backgroundLocation && <Routes>{modalRoutes.map(renderRoute)}</Routes>}
    </main>
  );
};

export default MainContents;
