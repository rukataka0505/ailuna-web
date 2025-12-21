/**
 * AI電話番の設定メタデータ
 * プレビュー画面のVisualタブで表示される情報を格納します。
 */
export interface ConfigMetadata {
    /** AIの口調・トーン（丁寧/フレンドリー/カジュアル） */
    tone?: 'polite' | 'friendly' | 'casual'
    /** 電話応対時の第一声の挨拶メッセージ（予約確認の問いかけ込み） */
    greeting_message: string
    /** ビジネスの説明文（例：「居酒屋のAI電話番」） */
    business_description: string
    /** 電話応対時の重要なルール（箇条書き） */
    rules: string[]
    /** 業種（例：「居酒屋」「美容院」「歯科医院」） */
    business_type?: string
    /** SMS通知テンプレート */
    sms_templates?: {
        approved: string
        rejected: string
    }
}

/**
 * AI電話番の完全な設定
 * Setup Conciergeで生成され、プレビュー画面に表示される単一の設定オブジェクトです。
 * 
 * 注意: この型は「現在の1つの設定」のみを表します。
 * 過去バージョンとの比較や before/after の機能は意図的に含まれていません。
 */
export interface AgentSettings {
    /** AI電話番として振る舞うための完全なシステムプロンプト（LLMに渡される指示書） */
    system_prompt: string
    /** プレビュー表示用のメタデータ（Visualタブで使用） */
    config_metadata: ConfigMetadata
}
