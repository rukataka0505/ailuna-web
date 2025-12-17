# ailuna-web（最新版 / 2025-12-17）

AiLuna の **SaaS管理画面**（Next.js + Supabase + Stripe）です。

- ログイン/サインアップ（Supabase Auth）
- AIエージェント設定（対話形式で system prompt を生成 → `user_prompts` に保存）
- 通話履歴の表示（`call_logs`）
- Stripe Checkout でサブスク購入（※Webhook実装が別途必要）

---

## 1. 主要技術
- Next.js（App Router）
- Supabase（Auth + DB）
- Stripe（Checkout）
- OpenAI（Builder用：Chat Completions）

---

## 2. 必須の環境変数（.env.local）
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx

# OpenAI（Builder / parse / generate が利用）
OPENAI_API_KEY=sk-...

# Builderモデル（任意）
AILUNA_MODEL_MINI=gpt-5-mini

# Stripe（Checkout）
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
# 従量課金を使う場合（任意）
NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID=price_...

# Stripe Webhook（実装済み）
STRIPE_WEBHOOK_SECRET=whsec_...

# WebhookからSupabaseを更新する場合（推奨：server-only env）
SUPABASE_SERVICE_ROLE_KEY=xxxx
```

## 3. Stripe Webhook 設定
ローカル開発でテストする場合：
1. Stripe CLIをインストール
2. `stripe login`
3. `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. 出力された `whsec_...` を `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定


> `NEXT_PUBLIC_*` はクライアントにも露出します。Price IDは秘匿不要ですが、**Secret Key / Service Role Key は公開しない**でください。

### 3.1 Stripe CLI のインストール
Webhookのテストには Stripe CLI が必要です `stripe.exe` はリポジトリから削除されたため、以下のようにインストールしてください。

- **Mac**: `brew install stripe/stripe-cli/stripe`
- **Windows**: `winget install Stripe.StripeCLI` または [公式サイト](https://docs.stripe.com/stripe-cli) からダウンロード
- **Linux**: [公式サイト](https://docs.stripe.com/stripe-cli) の手順を参照

---

## 3. 起動方法
```bash
npm install
npm run dev
```

---

## 4. 主要機能

### 4.1 AIエージェント設定（Concierge Builder）
- `src/app/dashboard/ConciergeBuilder.tsx`
- 生成 API：
  - `POST /api/builder/chat`（会話を進める）
  - `POST /api/builder/generate`（system_prompt + config_metadata を生成）
  - `POST /api/builder/parse`（system prompt → Visual表示用に分解）

生成した設定はダッシュボードから **保存**すると、`user_prompts` に保存されます。

### 4.2 通話履歴
- `src/components/CallLogList.tsx`
- サーバアクション：`src/app/dashboard/actions.ts`
- Supabase の `call_logs` から `user_id` でフィルタして取得します。

---

## 5. 重要な注意（セキュリティ/コスト）
現状の最新コードでは **/api/builder/chat と /api/builder/parse と /api/builder/generate が未ログインでも叩けてしまう**可能性があります。  
OpenAI API Key を使うため、必ず **ログイン必須（401）** に修正してください。

（Antigravityへの修正指示を別途用意しています）

---

## 6. Stripeサブスクを「成立」させるために必要なこと
Checkoutは作れますが、`profiles.is_subscribed` を更新するには **Stripe Webhook** が必要です。

推奨：
- `src/app/api/webhooks/stripe/route.ts` を web 側に実装し、
- `profiles.is_subscribed` / `profiles.stripe_customer_id` / `profiles.phone_number` を更新する

---

## 7. よくあるトラブル
- `OPENAI_API_KEY` 未設定：Builder関連APIが500
- `user_prompts` が無い：call-engine 側で DB 設定を読めず、fallback prompt になる

---

## 8. 電話予約フロー安定化 (Acceptance Criteria)
本リポジトリおよび `ailuna-call-engine` の改修における受け入れ基準です。

1. **Uniqueness**: 1通話 (`call_sid`) につき `reservation_requests` は最大1件のみ作成されること。
2. **Data Integrity**: `answers` カラムは常に JSON Object `{}` であること（Array `[]` は禁止）。
3. **Date/Time**: DB上の `requested_date` は `YYYY-MM-DD` (Date型)、`requested_time` は `HH:mm` (Time型) で保存されること。
4. **Notification**: 店舗への通知 (Email/LINE) は1予約リクエストにつき1回のみ送信されること。
5. **SMS Logging**: 予約の承認/却下時にSMSが送信された場合、`sms_body_sent` と `sms_sent_at` がデータベースに記録されること。
