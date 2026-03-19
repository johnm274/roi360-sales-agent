export type OutputMode = 'eli12' | 'standard' | 'board';

export type MessageRole =
    | 'user'
    | 'assistant'
    | 'system'
    | 'tool';

export interface Message {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    toolCalls: string | null;
    metadata: string | null;
    createdAt: string;
}

export interface Conversation {
    id: string;
    partnerId: string;
    title: string | null;
    useCase: string | null;
    outputMode: OutputMode;
    createdAt: string;
    updatedAt: string;
}
