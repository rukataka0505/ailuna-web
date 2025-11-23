export interface ConfigMetadata {
    tone: 'polite' | 'friendly' | 'casual'
    greeting_message: string
    business_description: string
    rules: string[]
    business_type?: string
}

export interface AgentSettings {
    system_prompt: string
    config_metadata: ConfigMetadata
}
