import crypto from "crypto";

import { transporter } from "../connection/mail.js";

const SMTP_FROM = process.env.SMTP_FROM;
const APP_BASE_URL = process.env.APP_BASE_URL;

// 認証メールの有効期限
export const VERIFICATION_EXPIRES_HOURS = 24;
export const PASSWORD_RESET_EXPIRES_HOURS = 1;

const statusMap = {
  approved: "貸出",
  return_pending: "返却",
  returned: "返却",
  rejected: "棄却",
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const sendRegisterApplication = async ({ to, user, approver, book }) => {
  const html = `
    <p>${approver} さん</p>
    <p>${user} さんが貸出の申請をしました。</p>
    <p>書籍名: ${book}</p>
    <p>確認をお願いします。</p>
  `;

  const text = `
    ${approver} さん

    ${user} さんが貸出の申請をしました。
    書籍名: ${book}

    確認をお願いします。
  `.trim();

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "貸出申請のご案内",
    text,
    html,
  });
};

export const sendUpdateApplication = async ({
  to,
  user,
  approver,
  book,
  status,
}) => {
  const html = `
    <p>${approver} さん</p>
    <p>${user} さんが${statusMap[status]}の申請をしました。</p>
    <p>書籍名: ${book}</p>
    <p>確認をお願いします。</p>
  `;

  const text = `
    ${approver} さん

    ${user} さんから${statusMap[status]}の申請をしました。
    書籍名: ${book}

    確認をお願いします。
  `.trim();

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "貸出申請更新のご案内",
    text,
    html,
  });
};

export const sendUpdateApproval = async ({
  to,
  user,
  approver,
  book,
  status,
}) => {
  const html = `
    <p>${user} さん</p>
    <p>${approver} さんが${statusMap[status]}申請の承認をしました。</p>
    <p>書籍名: ${book}</p>
    <p>確認をお願いします。</p>
  `;

  const text = `
    ${user} さん

    ${approver} さんが${statusMap[status]}申請の承認をしました。
    書籍名: ${book}

    確認をお願いします。
  `.trim();

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: `${statusMap[status]}申請承認のご案内`,
    text,
    html,
  });
};

export const sendVerificationEmail = async ({ to, name, token }) => {
  const verifyUrl = `${APP_BASE_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
    <p>${name} さん</p>
    <p>会員登録ありがとうございます。</p>
    <p>以下のリンクをクリックしてメール認証を完了してください。</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>このリンクには有効期限があります。</p>
  `;

  const text = `
    ${name} さん

    会員登録ありがとうございます。
    以下のリンクを開いてメール認証を完了してください。

    ${verifyUrl}

    このリンクには有効期限があります。
  `.trim();

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "メール認証のご案内",
    text,
    html,
  });
};

export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${APP_BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <p>${name} さん</p>
    <p>パスワード再設定のご依頼を受け付けました。</p>
    <p>以下のリンクをクリックして、新しいパスワードを設定してください。</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>このリンクには有効期限があります。</p>
    <p>心当たりがない場合は、このメールを破棄してください。</p>
  `;

  const text = `
    ${name} さん

    パスワード再設定のご依頼を受け付けました。
    以下のリンクを開いて、新しいパスワードを設定してください。

    ${resetUrl}

    このリンクには有効期限があります。
    心当たりがない場合は、このメールを破棄してください。
  `.trim();

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "パスワード再設定のご案内",
    text,
    html,
  });
};
