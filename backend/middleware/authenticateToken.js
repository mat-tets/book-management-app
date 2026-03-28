import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is not set");
}

export const authenticateToken = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({
      success: false,
      message: "Authorizationヘッダがありません",
      data: null,
    });
  }

  const [scheme, token] = auth.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Authorizationヘッダの形式が不正です（Bearer token）",
      data: null,
    });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "認証情報が無効です 再度サインインしてください",
      data: null,
    });
  }
};
