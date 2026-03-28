# Book Management App

社内で管理している書籍を、より手軽に利用できるようにするための貸出管理システムです。

管理者が書籍を登録することで、社員は好きなタイミングで貸出申請を行うことができ、  
申請から承認、返却までの流れをアプリケーション上で簡単に管理できます。

## 環境変数

以下をコピーして、.envを作成してください。

```bash
# JWT secret (ランダムな文字列を設定)
JWT_SECRET_KEY=your-jwt-secret-key

# DATABASE settings
POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DB=your-postgres-db

# postgresql://user:password@host:5432/db (host名はcompose.ymlで指定)
DATABASE_URL=postgresql://your-postgres-user:your-postgres-password@database:5432/your-postgres-db

# STORAGE settings
STORAGE_ACCESS_KEY=your-storage-access-key
STORAGE_SECRET_KEY=your-storage-secret-key
STORAGE_BUCKET=your-storage-bucket

# SMTP settings
SMTP_HOST=your-mail-host
SMTP_PORT=your-mail-port
SMTP_SECURE=true-or-false # SMTP_PORTに465を利用する場合は、true
SMTP_FROM=your-mail-from  # (例: "BookMap <no-reply@example.com>")

# Frontend URL (例: http://192.168.9.9)
APP_BASE_URL=your-server-url
```

## 起動方法

```bash
docker compose -f compose.yml -f compose.production.yml up -d --build
```

## 初期ユーザ

以下の初期ユーザが登録されています。  
必要なユーザが登録でき次第、停止および削除を行ってください。

| ユーザ名 | メールアドレス        | パスワード | ロール     |
| :------- | :-------------------- | :--------- | :--------- |
| admin    | admin@admin.com       | admin      | 管理ユーザ |
| approver | approver@approver.com | approver   | 承認ユーザ |
| general  | general@general.com   | general    | 一般ユーザ |

## ライセンス

本プロジェクトのソースコードは MIT License のもとで提供されています。

## サードパーティソフトウェア

本プロジェクトでは、以下のオープンソースソフトウェアを利用しています。

- MinIO（AGPL v3）  
  オブジェクトストレージとして外部サービスとして利用しています。

詳細は `THIRD_PARTY_NOTICES.md` を参照してください。
