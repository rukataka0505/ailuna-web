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
  - **AI設定**:
    - 電話応答時の挨拶と事業内容を設定可能
    - 設定は `user_prompts` テーブルに保存され、ログインユーザーごとに管理されます
  - ログアウト機能
- **ミドルウェア**:
  - セッション管理とルート保護
  - 未認証ユーザーのダッシュボードアクセス制限
  - LP (`/`) へのパブリックアクセス許可

## Supabase セットアップ

1. **スキーマの適用**
   - Supabase ダッシュボードの **SQL Editor** を開きます。
   - プロジェクトルートの `supabase/schema.sql` の内容をコピー＆ペーストして実行します。
   - **Table Editor** で `profiles` と `user_prompts` テーブルが作成されたことを確認してください。

## データベース設計

### テーブル構成

1. **`public.profiles`** (ユーザー管理・課金用)
   - `id`: UUID (Primary Key, `auth.users.id` 参照)
   - `stripe_customer_id`: Stripe顧客ID
   - `is_subscribed`: サブスクリプション状態
   - `usage_count`: 利用回数

2. **`public.user_prompts`** (AI設定用)
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (`profiles.id` 参照)
   - `greeting_message`: 挨拶メッセージ
   - `business_description`: 事業内容・指示

### セキュリティ (RLS)
- ユーザーは自身のデータのみ読み書き可能
- `profiles` はユーザー登録時に自動作成

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、Supabaseのプロジェクト情報を設定してください。

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 2. Stripe設定

`npm install stripe` でライブラリを導入済みです。
`.env.local` に `STRIPE_SECRET_KEY` を設定してください。

### 3. インストールと実行

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

### バックアップ (Git Push)

開発の区切りやバックアップを取りたいタイミングで、以下のコマンドを実行してください。

```bash
npm run backup
```

このコマンドは以下の処理を自動で行います：
1. 変更の有無をチェック
2. `git add .`
3. 日時入りのメッセージで `git commit`
4. `git push origin main`

※ AIエージェントは自動でプッシュを行いません。バックアップが必要な場合はこのコマンドを使用してください。
