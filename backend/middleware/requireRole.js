export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "未認証です", data: null });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "権限がありません", data: null });
    }

    next();
  };
