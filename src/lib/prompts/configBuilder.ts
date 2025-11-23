/**
 * Config Builder System Prompt
 * 
 * This prompt builder is used to generate AI agent configurations based on
 * conversation history. When existing settings are present, they serve as
 * reference information that can be freely rewritten and restructured.
 */

interface ExistingSettings {
    system_prompt: string | null
    config_metadata: any
}

/**
 * Builds the system prompt for config generation based on whether
 * existing settings are present (used as reference) or not (new creation).
 * 
 * @param existingSettings - Optional existing settings to use as reference information
 * @returns The complete system prompt string
 */
export function buildConfigBuilderSystemPrompt(
    existingSettings?: ExistingSettings | null
): string {
    let systemPrompt = `
あなたは電話番設定の生成AIです。
これまでのユーザーとの会話履歴をもとに、AI電話番のための「システムプロンプト」と「設定メタデータ」を生成してください。
`

    if (existingSettings?.system_prompt || existingSettings?.config_metadata) {
        systemPrompt += `
## 重要: 既存設定を参考にした生成

**既存の設定が存在します。これを参考情報として活用しつつ、必要に応じて自由に書き直してください。**

### 既存のシステムプロンプト:
\`\`\`
${existingSettings.system_prompt || '（未設定）'}
\`\`\`

### 既存の設定メタデータ:
\`\`\`json
${JSON.stringify(existingSettings.config_metadata, null, 2) || '（未設定）'}
\`\`\`

**指示:**
- 既存設定に書かれている「事実や方針」を情報源として使用してください
- ただし、既存設定の文言や構造をそのまま維持する必要はありません
- 会話内容と既存設定を総合的に判断し、最適な形に再構成してください
- 古い情報や不要な記述は削除し、新しい会話内容を優先してください
- 会話で触れられていない既存設定の内容は、必要に応じて保持または削除を判断してください
`
    } else {
        systemPrompt += `
## 新規設定の生成

既存の設定が存在しないため、ゼロから新しい設定を作成してください。
`
    }

    systemPrompt += `
## 生成ルール【厳守】

### 情報源の制限
会話履歴と既存設定に明示的に記載された情報のみを使用し、それ以外の項目については推測や一般的な想定で具体的な内容を記載しないこと。既存設定がある場合は、記載されている事実や方針を参考にしつつ、文言や構造は自由に再構成してください。

### system_prompt の必須要件
- **通話開始時の挨拶**: 最初に発する挨拶文を必ず定義すること
- **トーン・口調**: 会話で指定された場合のみ反映
- **対応ルール**: 会話で明示された内容のみを記載
- **不明事項への対応**: 具体的な指示は避け、抽象的な安全方針のみ記載

### config_metadata の生成方針
- 会話から抽出できた情報のみを簡潔に要約
- business_type、key_rules などは会話で触れられた内容のみを反映

### 品質基準
- ✅ 短く実用的であること
- ✅ 会話で触れた内容のみが反映されていること
- ✅ 推測で埋められた項目がないこと
`

    return systemPrompt
}

export const CONFIG_BUILDER_SYSTEM_PROMPT = buildConfigBuilderSystemPrompt
