# AiLuna システムREADME（最新版 / 2025-12-17）

このドキュメントは、**AiLuna（SaaS版：Web + Call Engine）** を「ゼロから動かす」ための**全体README**です。  
実装は **2リポジトリ**で構成されています。

- **ailuna-web**：SaaS管理画面（Next.js + Supabase Auth + Stripe Checkout）
- **ailuna-call-engine**：電話応答エンジン（Express + Twilio Media Streams + OpenAI Realtime）

---

## 1. 何ができる？

### Web（ailuna-web）
- Supabase Auth でログイン
- 「AIエージェント設定（Concierge Builder）」で **system prompt** を生成して保存（`user_prompts`）
- 通話履歴（`call_logs`）の一覧・全文・要約を確認
- Stripe Checkout でサブスク購入（※Webhook実装が必要：後述）

### Call Engine（ailuna-call-engine）
- Twilio Voice で電話着信 → Twilio Media Streams で音声をWebSocketに流す
- OpenAI Realtime API へ音声をブリッジ（双方向会話）
- 通話ログを Supabase `call_logs` に保存（transcript/summary/duration）
- Stripe に通話時間を usage record として報告（任意：従量課金を使う場合）

---

## 2. アーキテクチャ（ざっくり）

```mermaid
sequenceDiagram
  participant Caller as 発信者
  participant Twilio as Twilio Voice
  participant CE as ailuna-call-engine
  participant OA as OpenAI Realtime
  participant SB as Supabase
  participant Web as ailuna-web

  Caller->>Twilio: 店舗番号に発信
  Twilio->>CE: /incoming-call-realtime (Webhook)
  CE-->>Twilio: TwiML (Connect/Stream)
  Twilio->>CE: WebSocket /twilio-media (音声)
  CE<->>OA: Realtime WebSocket (音声/テキスト)
  CE->>SB: call_logs insert（通話ログ/要約/時間）
  Web->>SB: call_logs select（通話履歴表示）
  Web->>SB: user_prompts upsert（AI設定保存）
  CE->>SB: user_prompts select（AI設定読込）
```

---

## 3. Supabase（必須のDB要件）

最低限、以下が必要です：

### 必須テーブル
- `profiles`（Supabase Authの user_id = profiles.id）
  - `id uuid PK`
  - `is_subscribed boolean`
  - `stripe_customer_id text`
  - `phone_number text`（TwilioのTo番号と一致する値を入れる）
- `user_prompts`
  - `user_id uuid UNIQUE`
  - `system_prompt text`
  - `config_metadata jsonb`（`greeting_message` など）
- `call_logs`
  - `user_id uuid`
  - `call_sid text`
  - `transcript jsonb`
  - `summary text`
  - `duration_seconds integer`

### Builderの履歴（任意だが推奨）
- `concierge_chat_history`
  - `user_id uuid UNIQUE`
  - `messages jsonb`

### 電話番号の自動割当（任意）
- `phone_number_pool`
  - `phone_number text UNIQUE`
  - `status ('available' | 'assigned')`
  - `assigned_user_id uuid`

#### 重要：`profiles.phone_number` は一意推奨
Call Engine は `To` 番号で `profiles.phone_number` を検索してユーザーを特定します。  
そのため、`profiles.phone_number` が重複すると誤ルーティングになります。

---

## 4. Stripe（サブスク購入を「本当に」動かす条件）

### Checkout（Web側）は実装済み
`ailuna-web` の `/api/checkout` で Checkout Session を作っています。

### しかし「契約状態の反映」は Webhook が必要
`profiles.is_subscribed` を `true/false` に切り替えたり、`stripe_customer_id` を保存するために **Stripe Webhook** が必要です。

> 現状の最新ZIPでは、Webhookのコードが **call-engine側に Next Route として存在**しますが、call-engineは Express で動いているため、そのままだと動きません。  
> → **ailuna-web に Webhookルートを移植して動かす**のが最も自然です（推奨）。

---

## 5. Twilio（電話→WebSocketの接続）

Twilio Voice Number の Voice Webhook を call-engine の以下に向けます：

- `POST https://<CALL_ENGINE_PUBLIC_URL>/incoming-call-realtime`

call-engine は TwiML を返し、`/twilio-media` に Stream 接続します。

---

## 6. ローカル開発の最短手順

### 6.1 call-engine をローカル起動（ngrok推奨）
1. `ailuna-call-engine` で依存導入  
   `npm install`
2. `.env` 作成（`.env.example` をコピー）
3. ngrok 等で `PUBLIC_URL` を外部公開
4. 起動  
   `npm run dev`

### 6.2 web をローカル起動
1. `ailuna-web` で依存導入  
   `npm install`
2. `.env.local` 作成（Supabase/Stripe/OpenAI）
3. 起動  
   `npm run dev`

---

## 7. よくあるトラブル

### 通話が誰にも紐づかない
- `profiles.phone_number` が Twilio 着信の `To` と一致しているか確認（E.164推奨）
- `profiles.phone_number` が重複していないか確認

### 有料ユーザーなのに拒否される / 逆に無料でも通話できる
- `profiles.is_subscribed` の更新は **Stripe Webhookが必要**
- 現状の call-engine は「未契約なら throw」しても catch でフォールバックする構造があり、拒否が効かない可能性があります  
  → Antigravity修正指示に含めています。

### Builderが動かない
- `OPENAI_API_KEY` が web に設定されているか
- `/api/builder/*` は **ログイン必須にするべき**（現状は未保護のAPIがあり、OpenAIコストが漏れる可能性）

---

## 8. このREADMEの範囲外（今後の拡張）
- 予約自動化（`reservation_requests` 等）  
  ※この最新ZIPには予約UI/ロジックは含まれていません
