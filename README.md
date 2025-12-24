# AiLuna Web（ailuna-web）

かきくけこ
店舗向け「AiLuna（AI電話番）」の **管理画面 / 決済 / デモ通話** を提供するWebアプリです。  
（通話の実行・予約受付の自動応対は別サービス `ailuna-call-engine` が担当し、本Webは設定・確認・承認/却下・通知設定などを担います。）

- 最終更新: 2025-12-23

---

## 1. 解説

`ailuna-web` は店舗（事業者）がAiLunaを運用するための **管理ダッシュボード** です。主に以下を提供します。

- AI電話番の応対設定（話し方/挨拶/店舗情報など）
- 予約リクエストの確認・承認/却下（必要に応じてSMS通知）
- 予約通知（メール/LINE）設定
- 予約フォーム（通話で聞く項目）の編集
- 通話履歴（要約/時間/全文ログ）の閲覧・分析
- ブラウザ上でのデモ通話（WebSocket）
- Stripe決済（プラン管理）とWebhook連携

---

## 2. 店舗（顧客）に説明する主要機能（機能仕様）

### 2.1 AI電話番の応対設定（AIの「中身」を店舗が調整）
- **業種**（例: 飲食店、美容室など）
- **AIの話し方**（丁寧/親しみ/カジュアル）
- **第一声（電話に出た時の挨拶）**（店名を含める想定）
- **店舗情報・FAQ（システムプロンプト）**  
  営業時間/定休日/アクセス/メニュー/駐車場などを箇条書きで入力（Markdown対応）
- **SMS通知テンプレート（予約確定/お断り）**  
  予約確定時: `{{dateTime}}`, `{{partySize}}`  
  却下時: `{{reason}}`

> 予約承認/却下時に、このテンプレートを使ってお客様へSMSを自動送信できます（送信済みは再送しない、デモ通話のような非E.164番号は送信スキップ）。

---

### 2.2 予約リクエスト管理（電話で受けた予約を「見える化」）
- 予約リクエスト一覧（新しい順）
- フィルタ（ステータス/期間）
- 予約の詳細表示（希望日時/人数/回答内容 など）
- **承認 / 却下**（却下理由を付与可能）
- 店舗側の **内部メモ**（スタッフ共有用）
- お客様へ追記する **メッセージ**（SMS本文に追記可能）
- ステータス例: `pending / approved / rejected / auto_approved`

---

### 2.3 予約通知設定（メール / LINE）
- **メール通知**
  - 有効/無効
  - 通知先メールアドレス（複数）を登録
- **LINE通知**
  - 有効/無効
  - 連携用の **6桁コード** を発行（有効期限あり）
  - LINE連携後、店舗LINEへ予約通知を送れる構成

---

### 2.4 予約フォーム設定（電話で「何を聞くか」を店舗が決める）
予約受付時に回収する項目を、店舗ごとにカスタマイズできます。

- 項目タイプ: `text / number / date / time / select / multiline`
- 必須/任意、ON/OFF
- 選択式（select）は options を設定
- 表示順の並べ替え
- 初期テンプレ（例）: お名前 / 人数 / 希望日 / 希望時間 / 備考・要望

---

### 2.5 通話履歴（電話対応のログ・要約）
- 一覧: 日時 / 発信者番号 / 通話時間 / 要約
- フィルタ: 期間、発信者番号
- 展開時に **全文トランスクリプト** を表示（遅延ロード）
- 利用状況: 総通話数 / 総通話時間（分）

---

### 2.6 ブラウザでのデモ通話（店舗が導入前に体験できる）
- ログインユーザー向けに **デモ通話トークン** を発行
- `ailuna-call-engine` の WebSocket に接続し、ブラウザ上で応対体験が可能
- 1ユーザー同時1セッション、最大時間などの制限は call-engine 側で管理

---

### 2.7 プラン・決済（Stripe）
- 管理画面からStripe Checkoutへ遷移しアップグレード
- Webhookで `profiles.is_subscribed` を更新し、通話サービス側の利用可否と連動

---

## 3. システム構成（全体像）

- `ailuna-web`（本リポジトリ）
  - 店舗向け管理画面
  - Stripe Checkout / Stripe Webhook
  - 予約承認/却下 → SMS送信（Twilio Messaging）
  - デモ通話トークン発行
- `ailuna-call-engine`（別リポジトリ）
  - Twilio Voice（電話着信）とAI応対
  - 予約データの生成・通知（メール/LINE等）
  - 通話ログ（要約/全文）の保存
- Supabase
  - Auth / DB（profiles, user_prompts, call_logs, reservation_requests, …）

---

## 4. 主要画面/ルート

- `/` : LP
- `/login`, `/signup` : 認証
- `/dashboard` : 管理画面
  - AI電話番設定
  - 予約管理
  - 予約通知設定（メール/LINE）
  - 予約フォーム設定
  - 通話履歴
  - プラン・決済
- `/demo-call` : デモ通話

---

## 5. 環境変数（.env.local）

### 5.1 必須（基本機能）
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（Webhook等で管理者クライアントを使う場合）
- `NEXT_PUBLIC_SITE_URL`

### 5.2 Stripe（決済）
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PRICE_ID`
- （任意）`NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID`

### 5.3 SMS（予約承認/却下通知）
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_MESSAGING_SERVICE_SID` または送信元番号運用に必要な設定

### 5.4 デモ通話（WebSocket）
- `WEB_DEMO_SHARED_SECRET`
- `CALL_ENGINE_WS_URL`（例: `wss://<call-engine-host>` ※末尾に `/web-demo-media` を付けて接続します）

---

## 6. 開発手順（ローカル）

```bash
npm install
npm run dev
7. Stripe Webhook（サブスク有効化）

本アプリは checkout.session.completed を受け取り、profiles.is_subscribed = true などを更新します。
ローカル開発ではStripe CLIを利用してください。

stripe listen --forward-to localhost:3000/api/webhooks/stripe

8. デモ通話の設定

WEB_DEMO_SHARED_SECRET は web と call-engine で同一 にします。

web側: /api/demo-call/token がトークンを発行し、CALL_ENGINE_WS_URL/web-demo-media を返します。

call-engine側: 受け取ったトークンを検証し、デモ通話セッションを開始します。

9. Supabase（DB前提・主なテーブル）

本アプリが参照/更新する主なテーブル（例）:

profiles（is_subscribed, phone_number, stripe_customer_id 等）

user_prompts（system_prompt, config_metadata）

call_logs（summary, duration_seconds, transcript 等）

reservation_requests（予約一覧・承認/却下・SMS送信ログ 等）

reservation_form_fields（予約フォーム項目）

store_notification_settings（メール/LINE通知設定）

line_link_tokens（LINE連携コード）

補足:

通話時間集計は sum_call_duration_seconds RPC があると効率的です（無い場合はフォールバック集計します）。

Webhook後の電話番号割当は claim_phone_number RPC が存在する場合に実行されます（存在しなくてもWebhook自体は成功扱い）。

10. トラブルシューティング

予約のSMSが送られない

お客様番号がE.164形式（+81...）でない場合は送信しません（デモ通話など）

Twilioの環境変数/送信設定を確認

通話履歴が空

call-engineが call_logs に保存しているか、user_id 紐付けを確認

Stripe決済後に通話が有効化されない

Stripe Webhookが到達しているか確認（STRIPE_WEBHOOK_SECRET）

profiles.is_subscribed が更新されているか確認