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
 
 ### 1. プロジェクトの作成
 Supabase で新しいプロジェクトを作成してください。
 
 ### 2. スキーマの適用 (SQL Editor)
 データベースのテーブルとセキュリティ設定を作成します。
 
 1. Supabase ダッシュボードの左サイドバーから **SQL Editor** を開きます。
 2. 「New Query」をクリックして新しいクエリエディタを開きます。
 3. プロジェクトルートの `../supabase/schema.sql` の内容をすべてコピーし、エディタに貼り付けます。
 4. **Run** ボタンをクリックして実行します。
 5. 画面右下のログに "Success" と表示されれば完了です。
 
 ### 3. テーブル作成の確認
 左サイドバーの **Table Editor** を開き、以下のテーブルが作成されていることを確認してください：
 
 - `profiles`: ユーザー情報（Stripe IDなど）
 - `user_prompts`: AI設定（挨拶文、事業説明）
 
 > [!IMPORTANT]
 > `user_prompts` テーブルの `user_id` カラムには **Unique** 制約が必要です。`schema.sql` にはこれが含まれていますが、もし手動で作成した場合は必ず追加してください。これがないと設定の保存（Upsert）が正しく動作しません。

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
- ユーザーは自身のデータのみ読み書き可能 (`auth.uid() = user_id`)
- `profiles` はユーザー登録時にトリガーによって自動作成されます
- `user_prompts` はダッシュボードで設定を保存したタイミングで作成・更新されます

## ダッシュボード設定の保存仕様

- **保存先**: `user_prompts` テーブル
- **データ構造**: 1ユーザーにつき1レコード (`user_id` で一意)
- **挙動**:
  - フォームを開くと、現在の設定が読み込まれます（未設定時は空欄）。
  - 「設定を保存する」ボタンを押すと、`upsert` 処理が実行されます。
  - 既存のレコードがあれば更新、なければ新規作成されます。
  - 保存後はページが再検証され、最新の状態が表示されます。

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
