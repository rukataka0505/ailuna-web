# AiLuna (SaaS版) - AI電話取次サービス

AI電話取次サービス「AiLuna」のSaaS版Webアプリケーションです。
Next.jsとSupabaseを使用して構築されており、セキュアな認証機能とモダンなLPを備えています。

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & DB**: Supabase
- **Icons**: Lucide React

## 機能

- **ランディングページ (LP)**:
  - 未ログインユーザー向けのサービス紹介ページ
  - ログイン/新規登録フォームの埋め込み (`src/components/AuthForm.tsx`)
  - レスポンシブデザイン
- **認証機能**:
  - メールアドレス/パスワードによるサインアップ・ログイン
  - Supabase Auth UI と Server Actions を併用
  - ログインページを廃止し、トップページ（LP）に統合
  - 未認証ユーザーは自動的にトップページへリダイレクト
- **ダッシュボード**:
  - ログイン済みユーザーのみアクセス可能 (`/dashboard`)
  - ユーザー情報の表示
  - ログアウト機能
- **ミドルウェア**:
  - セッション管理とルート保護
  - 未認証ユーザーのダッシュボードアクセス制限
  - LP (`/`) へのパブリックアクセス許可

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、Supabaseのプロジェクト情報を設定してください。

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. インストールと実行

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## 開発ガイド

### コード概要の更新

大きな変更を行った後は、以下のコマンドを実行してコードの要約ファイルを更新してください。

```bash
npm run summary
```

これにより、`project_code_summary.txt` が最新化され、AIエージェントとのコンテキスト共有がスムーズになります。
