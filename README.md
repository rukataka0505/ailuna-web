# AiLuna (SaaS版) - AI電話取次サービス

AI電話取次サービス「AiLuna」のSaaS版Webアプリケーションです。
Next.jsとSupabaseを使用して構築されており、セキュアな認証機能とモダンなLPを備えています。

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth & DB**: Supabase
- **AI**: OpenAI API (GPT-4o, GPT-5 系列)
- **Payment**: Stripe (サブスクリプション + 従量課金)
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Validation**: Zod

## 主要機能

### 1. ランディングページ (`/`)

未ログインユーザー向けのサービス紹介ページ

**構成**:
- ヘッダー: ロゴと認証ボタン（「ログイン」「無料で始める」）
- ヒーローセクション: キャッチコピーとメインCTAボタン
- 機能紹介セクション: 3つの主要機能を紹介
  - **トーク形式での通話履歴確認**: チャットのように会話を振り返れる機能
  - **AIプロンプトの編集機能**: お店ごとにAIオペレーターをカスタマイズ可能
  - **ダッシュボードでの可視化**: 着信状況・利用時間・請求額をひと目で把握
- フッターCTA: アカウント登録への誘導
- レスポンシブデザイン対応

### 2. 認証機能

**認証ページ** (`/login`):
- ログイン／新規登録の共通入り口
- クエリパラメータ（`?mode=login` または `?mode=signup`）でタブを制御
- メールアドレス/パスワードによるサインアップ・ログイン
- Supabase Auth と Server Actions を併用

**新規登録時の必須入力項目**:
- メールアドレス
- パスワード（確認用含む）
- 氏（lastName）と名（firstName）- 横並び表示
- アカウント名（accountName）

登録完了後、`profiles` テーブルに以下が自動保存されます：
- `full_name`: 「氏」と「名」を結合した文字列（例：「大塚 孝雄」）
- `account_name`: 入力されたアカウント名（例：「大塚ラーメン本店」）

**実装詳細**:
- `src/components/AuthForm.tsx`: フォーム入力のハンドリング
- `src/app/login/actions.ts`: `signup` サーバーアクション
- **Supabase Trigger**: `handle_new_user` 関数がトリガーされ、メタデータから `profiles` テーブルに値を自動挿入

**メール認証フロー**:
- サインアップ時、認証メールのリンクは `/auth/complete` にリダイレクト
- `/auth/callback` は内部的な認証コード交換用のルートハンドラー
- 認証リンククリック後、`/auth/complete`（完了画面）へ遷移
- 完了画面から「ログインしてマイページを開く」ボタンでダッシュボードへ移動

**Supabase 設定要件**:
Supabase Dashboard の Authentication → URL Configuration で以下を設定：
- Site URL: 本番環境のURL（例：`https://ailuna-web.vercel.app`）
- Redirect URLs: 以下のパターンを許可リストに追加
  - `https://ailuna-web.vercel.app/**` (本番環境)
  - `http://localhost:3000/**` (ローカル開発環境)

**パスワードリセット機能**:
- ログインフォームから「パスワードをお忘れですか？」リンクで申請
- メールで送信されたリンクから `/auth/update-password` ページへ遷移
- 新しいパスワードを入力して更新
- 更新完了後はダッシュボードへ自動リダイレクト

**認証フォームの強化機能**:
1. パスワード表示切り替え（Eye/EyeOff アイコン）
2. パスワード確認機能（新規登録時のみ）
3. モード切り替えアニメーション（Framer Motion）
4. 登録完了フィードバック
5. ボタン操作感の向上（クリックアニメーション、処理中表示）

### 3. ダッシュボード (`/dashboard`)

ログイン済みユーザーのみアクセス可能なマイページ

**セクション構成**:

#### 3.1 ダッシュボード（メトリクス表示）
- **着信対応回数**: ユーザーの全通話ログ数
- **利用時間**: `call_logs.duration_seconds` の合計（秒）を分単位で表示
  - `duration_seconds` が `NULL` のレコードは `0` 秒として計算
- **今月の請求額**: 現在はダミー表示（¥0）
  - 将来的に通話時間や料金設定に基づいた計算ロジックが実装予定
- Next.js Streaming (Suspense) を利用し、計算中もスケルトン表示でUIをブロックしない設計

#### 3.2 アカウント管理
- アカウント情報の確認・変更（現在はプレースホルダー）

#### 3.3 プラン・決済
- 現在のプラン（フリープラン）の表示
- プロプランへのアップグレード機能
- **Stripe Checkout 連携**:
  - 「アップグレード」ボタンをクリックすると、Stripe の決済ページへ遷移
  - 決済完了後は `/dashboard?payment=success` にリダイレクト
  - キャンセル時は `/dashboard?payment=cancelled` にリダイレクト
- **ハイブリッド課金モデル**:
  - 固定料金（月額）と従量課金（通話料）の両方に対応
  - `NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID` が設定されている場合、従量課金も含む
  - 設定されていない場合、固定料金のみのサブスクリプションとして動作（後方互換性）

**必要な環境変数**:
- `STRIPE_SECRET_KEY`: Stripe シークレットキー
- `NEXT_PUBLIC_STRIPE_PRICE_ID`: サブスクリプションプランの固定料金 Price ID
- `NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID` (オプション): 従量課金の Price ID

#### 3.4 AIエージェント設定（Setup Concierge）

**対話型セットアップ**: AIコンシェルジュとの会話を通じて、AI電話番の設定を自動生成

**チャット機能**:
- ビジネス内容、口調、ルールなどをヒアリング
- 会話履歴は自動保存され、ページリロード後も復元される（`concierge_chat_history` テーブル）
- 最新50件のメッセージを保持
- API エンドポイント: `/api/builder/chat`

**設定生成**:
- 3往復以上の対話後、「設定を生成する」ボタンが有効化
- OpenAI API を使用して `system_prompt` と `config_metadata` を自動生成
- 既存設定がある場合は差分更新として動作（会話で触れた部分のみを更新）
- API エンドポイント: `/api/builder/generate`
- 使用モデル: `AILUNA_MODEL_MINI` (デフォルト: gpt-5-mini)

**設定プレビュー**:
- **重要**: プレビューは常に「現在の1つの設定」のみを表示
- 過去バージョンとの比較や before/after 表示は意図的に含まれていない
- **Visualタブ**: 業種、口調、挨拶メッセージ、重要ルールをカード形式で表示
- **Codeタブ**: `system_prompt` の全文をRaw形式で表示
- **プロンプト編集機能**: 
  - Codeタブで直接編集可能
  - 編集後、AIが自動的にパース（`/api/builder/parse`）
  - パース結果がVisualタブに反映される（逆同期）

**保存機能**:
- 「保存」ボタンで設定を `user_prompts` テーブルに永続化
- 保存後はAI電話番（Call Engine）が新しい設定を使用
- サーバーアクション: `saveAgentSettings` in `src/app/dashboard/actions.ts`

**リセット機能**:
- **会話リセット**: チャット履歴をクリア（設定は保持）
- **設定リセット**: 設定を完全削除（DBから物理削除）
  - サーバーアクション: `deleteAgentSettings`

**設計思想**:
- シンプルさを重視し、単一の設定のみを管理
- 将来的にバージョン管理が必要な場合は、別画面・別コンポーネントとして実装予定

**関連プロンプト**:
- `src/lib/prompts/setupConcierge.ts`: チャット用システムプロンプト
- `src/lib/prompts/configBuilder.ts`: 設定生成用システムプロンプト
- `src/lib/prompts/configParser.ts`: プロンプト解析用システムプロンプト

#### 3.5 通話履歴

- アコーディオン形式で過去の通話ログを表示
- クリックで詳細な会話内容を展開/折りたたみ可能
- AI生成の要約タイトルで内容を一目で把握
- 日時、電話番号、要約を一覧表示

**ページネーション機能**:
- 「さらに読み込む」ボタンで過去の履歴を順次ロード
- サーバーアクション: `fetchCallLogsPaginated`

**高度なフィルター機能**:
- **期間指定**: 開始日と終了日を指定してログを絞り込み
- **発信者指定**: 過去の発信者番号リストから特定の発信者を絞り込み
- フィルター適用中もページネーションが動作
- ポップアップ表示で画面の専有面積を削減

**フィルターUI改善**:
- フィルターアイコンボタンをクリックした時のみ条件設定フォームを表示
- 視認性の向上（ラベルテキスト色を濃く調整）
- 直感的な開閉操作（アイコンクリックで開く、外側クリック/×ボタンで閉じる）

### 4. ヘッダーナビゲーション

全ページ共通のヘッダーコンポーネント（`src/components/Header.tsx`）

- 左側: AiLunaロゴ（クリックでトップページへ）
- 右側: 
  - 「ログイン」ボタン（テキストスタイル） → `/login?mode=login` に遷移
  - 「無料で始める」ボタン（プライマリスタイル） → `/login?mode=signup` に遷移

### 5. ダッシュボードヘッダー構成

ダッシュボードのヘッダー（サイドバーおよびモバイルヘッダー）

**アカウント情報カード**:
- ロゴ「AiLuna」の下に、アカウント名と電話番号を1つのカードで表示
- データソース: `profiles.account_name` および `profiles.phone_number` カラム
- **デザイン**: アイコンベースのモダンなレイアウト
  - アカウント名: User アイコン + 名前（太字）
  - 電話番号: Phone アイコン + 番号（サブ情報）
  - デスクトップでは1行表示（例：👤 rukataka0505 ・ 📞 +1573...）
  - モバイルでは折り返し対応
- **未登録時の表示**:
  - アカウント名が未設定の場合: 「未設定」と表示
  - 電話番号が未登録の場合: 「未登録」とグレーアウト表示
- コンポーネント: `src/components/AccountInfoCard.tsx`
- サーバーアクション: `fetchUserProfile()` in `src/app/dashboard/actions.ts`

### 6. モバイル対応

- レスポンシブデザイン対応
- モバイル時はハンバーガーメニューからドロワーナビゲーションを表示
- ドロワーは**右側**からスライドインする仕様
- モバイル入力フィールドの自動ズーム防止（`text-base lg:text-sm`）
- モバイルプレビュー高さの最適化

### 7. ミドルウェア

セッション管理とルート保護（`src/middleware.ts`）

- 未認証ユーザーのダッシュボードアクセス制限
- LP (`/`) へのパブリックアクセス許可
- 認証済みユーザーの自動リダイレクト

### 8. 静的ページ

#### 利用規約ページ (`/terms`)
- **目的**: AiLunaサービスの利用条件を明示
- **構成**: 第1条〜第8条（適用、定義、登録、禁止事項、サービスの提供の停止・中断、免責事項、利用規約の変更、準拠法・裁判管轄）
- **デザイン**: 既存ページと統一されたグラデーション背景、読みやすい余白設定、レスポンシブ対応
- **注意**: 現在の内容はドラフト版です。正式版は法的レビューを経て公開される予定です。

#### プライバシーポリシーページ (`/privacy`)
- **目的**: ユーザー情報の取り扱い方針を説明
- **構成**:
  1. 収集する情報（アカウント情報、通話ログ、自動収集データ）
  2. 情報の利用目的
  3. 情報の第三者提供（Supabase、OpenAI、Twilioの利用を明記）
  4. 情報の保存期間・削除
  5. セキュリティ対策
  6. クッキー等の利用
  7. プライバシーポリシーの変更
  8. お問い合わせ窓口（現在は準備中）
- **デザイン**: 利用規約ページと統一されたレイアウト、セクションごとの明確な見出し
- **注意**: 現在の内容はドラフト版です。正式版は法的レビューを経て公開される予定です。

### 9. UI/UX改善

#### 統一された操作感（インタラクション）
アプリ全体のボタンやインタラクティブ要素に対し、一貫した操作フィードバックを提供：

1. **クリックエフェクト**
   - 全ての主要ボタンに `active:scale-[0.96]` を適用
   - クリック時にわずかに縮む効果で「押した」感覚を提供
   - ダッシュボード、認証フォーム、設定保存ボタンなど全体で統一

2. **ホバーエフェクト**
   - インタラクティブ要素には `hover:opacity-90` や `hover:bg-XXX-700` を適用
   - マウスオーバー時の反応を明確化

3. **ローディング表現**
   - 処理中（`isPending` / `isLoading`）はボタンを `disabled` に設定
   - `cursor: not-allowed` でインタラクション不可を明示
   - スピナーアイコンと「処理中...」テキストで状態を可視化

## データベース設計

### テーブル構成

#### 1. `public.profiles` (ユーザー管理・課金用)
- `id`: UUID (Primary Key, `auth.users.id` 参照)
- `stripe_customer_id`: Stripe顧客ID
- `is_subscribed`: サブスクリプション状態
- `usage_count`: 利用回数
- `phone_number`: 電話番号（国際形式、例：+81-90-1234-5678）
- `full_name`: 氏名（例：大塚 孝雄）
- `account_name`: アカウント名（表示用、例：AiLuna実験店舗）
- `updated_at`: 更新日時

#### 2. `public.user_prompts` (AI設定用)
- `id`: UUID (Primary Key)
- `user_id`: UUID (`profiles.id` 参照, **UNIQUE制約**)
- `greeting_message`: 挨拶メッセージ（DB直接保存用、レガシーフィールド）
- `business_description`: 事業内容・指示（DB直接保存用、レガシーフィールド）
- `system_prompt`: AI電話番の完全なシステムプロンプト（TEXT型）
- `config_metadata`: 設定メタデータ（JSONB型）
  - `tone`: 口調 ('polite' | 'friendly' | 'casual')
  - `greeting_message`: 挨拶メッセージ（プレビュー表示用）
  - `business_description`: 事業内容（プレビュー表示用）
  - `rules`: ルール配列
  - `business_type`: 業種
- `created_at`: 作成日時
- `updated_at`: 更新日時

> [!IMPORTANT]
> `user_prompts` テーブルの `user_id` カラムには **Unique** 制約が必要です。これがないと設定の保存（Upsert）が正しく動作しません。

#### 3. `public.call_logs` (通話履歴)
- `id`: UUID (Primary Key)
- `user_id`: UUID (`profiles.id` 参照)
- `call_sid`: Twilio Call SID
- `caller_number`: 発信者電話番号
- `transcript`: JSONB 形式の会話ログ
- `summary`: AI生成の要約タイトル（20文字程度）
- `duration_seconds`: 通話時間（秒単位）
- `created_at`: 通話日時
- `updated_at`: 更新日時

**インデックス**:
- `call_logs_user_id_idx` on `user_id`
- `call_logs_created_at_idx` on `created_at desc`

#### 4. `public.concierge_chat_history` (Setup Concierge トーク履歴)
- `id`: UUID (Primary Key)
- `user_id`: UUID (`profiles.id` 参照, **UNIQUE制約**)
- `messages`: JSONB 形式のメッセージ配列
  - 各メッセージは `role`, `content`, `timestamp` を含む
  - 最新50件のメッセージのみ保持
- `created_at`: 会話開始日時
- `updated_at`: 最終更新日時
- **用途**: Setup Concierge（AIエージェント設定）での対話履歴を保存し、ページ再読み込み時に復元

### セキュリティ (RLS)

- ユーザーは自身のデータのみ読み書き可能 (`auth.uid() = user_id`)
- `profiles` はユーザー登録時にトリガーによって自動作成されます
- `user_prompts` はダッシュボードで設定を保存したタイミングで作成・更新されます
- `concierge_chat_history` は Setup Concierge での会話中に自動保存されます
- `call_logs` は Service Role で挿入可能（Call Engine からの保存用）

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

### 3. 追加セットアップ（必須）

以下のSQLファイルを順番に実行してください：

#### 3.1 通話履歴機能のテーブル追加
1. `../supabase/add_summary_column.sql` を実行
2. `call_logs` テーブルと `summary` カラムが追加されます

#### 3.2 電話番号表示機能のセットアップ
1. `../supabase/add_phone_number_column.sql` を実行
2. `profiles` テーブルに `phone_number` カラムが追加されます

#### 3.3 氏名カラムのセットアップ
1. `../supabase/add_full_name_column.sql` を実行
2. `profiles` テーブルに `full_name` カラムが追加されます

#### 3.4 アカウント名表示機能のセットアップ
1. `../supabase/add_account_name_column.sql` を実行
2. `profiles` テーブルに `account_name` カラムが追加されます

#### 3.5 Setup Concierge トーク履歴機能のセットアップ（重要）
1. `../supabase/concierge_chat_history.sql` を実行
2. `concierge_chat_history` テーブルが作成されます

**このテーブルがないと以下のエラーが発生します**:
```
Could not find the table 'public.concierge_chat_history' in the schema cache
```

詳細な手順は `MIGRATION_GUIDE.md` を参照してください。

#### 3.6 システムプロンプトカラムのセットアップ（重要）
1. `../supabase/add_system_prompt_columns.sql` を実行
2. `user_prompts` テーブルに `system_prompt` (TEXT) と `config_metadata` (JSONB) カラムが追加されます

#### 3.7 新規ユーザートリガーの更新
1. `../supabase/update_handle_new_user.sql` を実行
2. `handle_new_user` 関数が更新され、`full_name` と `account_name` がメタデータから自動挿入されます

### 4. テーブル作成の確認
左サイドバーの **Table Editor** を開き、以下のテーブルが作成されていることを確認してください：

- `profiles`: ユーザー情報（Stripe IDなど）
- `user_prompts`: AI設定（system_prompt、config_metadata）
- `call_logs`: 通話履歴（Call Engine からの保存用）
- `concierge_chat_history`: Setup Concierge のトーク履歴

### 5. 認証設定

Supabase Dashboard の **Authentication → URL Configuration** で以下を設定：

- **Site URL**: 本番環境のURL（例：`https://ailuna-web.vercel.app`）
- **Redirect URLs**: 以下のパターンを許可リストに追加
  - `https://ailuna-web.vercel.app/**` (本番環境)
  - `http://localhost:3000/**` (ローカル開発環境)

これにより `/auth/complete` へのリダイレクトが正常に動作します。

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の情報を設定してください。

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
AILUNA_MODEL_NANO=gpt-5-nano
AILUNA_MODEL_MINI=gpt-5-mini
AILUNA_MODEL_HIGH=gpt-5

# Stripe (サーバーサイド用）
STRIPE_SECRET_KEY=your_stripe_secret_key

# Stripe (Webhook用 - CLIで取得したもの)
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe (フロントエンド用 - Price ID)
# 月額固定プランのID (例: ¥19,500/月)
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxxxxxxxxxxxx

# 従量課金のID (例: ¥30/分) - オプション
NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID=price_xxxxxxxxxxxxx
```

### 2. Stripe設定

`npm install stripe` でライブラリを導入済みです。
`.env.local` に `STRIPE_SECRET_KEY` を設定してください。

**ハイブリッド課金モデル**:
- `NEXT_PUBLIC_STRIPE_PRICE_ID`: 固定料金（必須）
- `NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID`: 従量課金（オプション）
  - 設定されている場合、固定料金と従量課金の両方を含むハイブリッド課金モデルとして動作
  - 設定されていない場合、固定料金のみのサブスクリプションとして動作（後方互換性）

### 3. インストールと実行

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## 開発ガイド

### 認証UXの動作確認

新しい認証フローの動作確認手順：

#### 1. ランディングページ（`/`）の確認
```bash
npm run dev
```
ブラウザで `http://localhost:3000` を開き、以下を確認：
- ヘッダーに「ログイン」と「無料で始める」ボタンが表示されている
- ページ内に認証フォームが**表示されていない**（製品紹介のみ）
- ヒーローセクションの「無料で試してみる」ボタンをクリック → `/login?mode=signup` に遷移
- ヘッダーの「ログイン」ボタンをクリック → `/login?mode=login` に遷移
- ヘッダーの「無料で始める」ボタンをクリック → `/login?mode=signup` に遷移

#### 2. ログインページ（`/login`）の確認
- `http://localhost:3000/login` に直接アクセス → ログインタブがアクティブ
- `http://localhost:3000/login?mode=login` にアクセス → ログインタブがアクティブ
- `http://localhost:3000/login?mode=signup` にアクセス → アカウント登録タブがアクティブ
- フォーム内のタブ切り替えボタンで、ログイン⇔アカウント登録の切り替えが正常に動作

#### 3. レスポンシブデザインの確認
ブラウザのDevToolsでモバイルビューポート（375px幅）に切り替え：
- ヘッダーのボタンが正しく表示され、レイアウトが崩れていない
- ランディングページの各セクションが適切に表示される
- ログインページのフォームが適切に表示される

#### 4. 既存の認証フローの確認
- `/login?mode=signup` から新規登録を実行 → 認証メール送信の成功画面が表示される
- `/login?mode=login` からログインを実行 → ダッシュボードにリダイレクトされる
- パスワードリセットフローが正常に動作する

#### 5. 静的ページの確認
```bash
npm run dev
```
ブラウザで以下のURLにアクセスし、ページが正しく表示されることを確認：
- `http://localhost:3000/terms` - 利用規約ページ
  - 8つのセクション（第1条〜第8条）が表示される
  - トップページへ戻るリンクが機能する
  - レスポンシブデザインが適用されている
- `http://localhost:3000/privacy` - プライバシーポリシーページ
  - 8つのセクション（1〜8）が表示される
  - 外部サービス（Supabase、OpenAI、Twilio）の記載がある
  - トップページへ戻るリンクが機能する

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

## API エンドポイント

### 認証関連
- `/api/auth/callback`: 認証コード交換用（内部使用）

### Setup Concierge 関連
- `/api/builder/chat`: チャット応答生成
- `/api/builder/generate`: 設定生成（system_prompt + config_metadata）
- `/api/builder/parse`: プロンプト解析（逆同期用）
- `/api/builder/history`: チャット履歴の保存・取得

### 決済関連
- `/api/checkout`: Stripe Checkout Session 作成

## トラブルシューティング

### 通話要約が表示されない場合

ダッシュボードの通話履歴に「要約なし」と表示され続ける場合、バックエンド（AiLuna Call Engine）側の要約生成処理でエラーが発生している可能性があります。
特に、`gpt-5.1` などの最新モデルを使用する場合は、バックエンド側のコードが `developer` ロールや `max_completion_tokens` に対応している必要があります。
正常に生成された場合、Supabaseの `call_logs` テーブルの `summary` カラムにタイトルが保存され、自動的に一覧に反映されます。

### concierge_chat_history テーブルが見つからない

以下のエラーが発生する場合：
```
Could not find the table 'public.concierge_chat_history' in the schema cache
```

`../supabase/concierge_chat_history.sql` を実行して、テーブルを作成してください。
詳細は `MIGRATION_GUIDE.md` を参照してください。

### system_prompt カラムが見つからない

以下のエラーが発生する場合：
```
column "system_prompt" does not exist
```

`../supabase/add_system_prompt_columns.sql` を実行して、カラムを追加してください。

### Stripe Checkout でエラーが発生する

**従量課金（metered billing）のエラー**:
```
You cannot use `quantity` on a price with `usage_type=metered`
```

これは、従量課金の Price ID に `quantity` パラメータを指定した場合に発生します。
`src/app/api/checkout/route.ts` で、従量課金の Price には `quantity` を含めないように実装されています。

**環境変数の確認**:
- `NEXT_PUBLIC_STRIPE_PRICE_ID` と `NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID` が正しく設定されているか確認
- 固定料金と従量課金の Price ID が逆になっていないか確認

## 今後の予定

- フッターへの「利用規約」「プライバシーポリシー」リンクの追加
- 法的レビュー後の文言修正
- お問い合わせ窓口情報の追加
- アカウント管理セクションの実装
- 請求額の自動計算ロジックの実装
- バージョン管理機能の実装（別画面・別コンポーネント）

## ライセンス

Private

## 関連ドキュメント

- `MIGRATION_GUIDE.md`: データベースマイグレーション手順
- `DEPLOYMENT_GUIDE.md`: デプロイメント手順
- `DATABASE_FIX_SUMMARY.md`: データベース修正の詳細
- `IMPLEMENTATION_SUMMARY.md`: 実装の詳細
- `DIFFERENTIAL_UPDATE_GUIDE.md`: 差分更新の詳細
