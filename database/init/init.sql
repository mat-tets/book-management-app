-- UUID拡張
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ユーザ
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('lock', 'general', 'approver', 'admin')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初期ユーザ
INSERT INTO users (id, name, email, password_hash, role, is_verified)
VALUES
    (uuid_generate_v4(), 'general', 'general@general.com', '$2b$10$ZSJ5RkGTRmOr5vZsZhLglu4KWTaxf3ggFuzfSaLUc0pcutu1tLaX2', 'general', 'true'),
    (uuid_generate_v4(), 'approver', 'approver@approver.com', '$2b$10$fHBYAOgsLhvo4YTuU/qdwOFvUmR/1RXbyczkUpboBr9/F1TMK1jd.', 'approver', 'true'),
    (uuid_generate_v4(), 'admin', 'admin@admin.com', '$2b$10$lgWMcjDljdDJP/kn4NBCvem.EV79M8AHWS3K3Pun.MXDvgyOLPnkS', 'admin', 'true');

-- ユーザ認証
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 出版社
CREATE TABLE publishers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- ジャンル
CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- 書籍
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_transcription TEXT,
    edition TEXT,
    publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
    publish_date DATE,
    publish_year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM publish_date)::INTEGER) STORED,
    pages INTEGER,
    genre_id UUID REFERENCES genres(id) ON DELETE SET NULL,
    isbn TEXT NOT NULL UNIQUE,
    stock_count INTEGER NOT NULL DEFAULT 0,
    cover_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 著者
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_transcription TEXT,
    UNIQUE (name, name_transcription)
);

-- 書籍と著者の中間テーブル
CREATE TABLE book_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    UNIQUE (book_id, author_id)
);

-- 貸出履歴
CREATE TABLE loan_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'return_pending', 'returned', 'rejected')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    loan_start_at TIMESTAMP,
    loan_end_at TIMESTAMP,
    returned_at TIMESTAMP
);

-- ログインログ
CREATE TABLE login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- パスワードリセット
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
