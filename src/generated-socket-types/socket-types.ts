import type { Socket as SocketBase } from "socket.io-client";

export namespace Root {
    /** @desc The actual path of the Root namespace */
    export const path = "/";
    export interface Emission {
        "settings:updated": (p1: {
            settingKey: string;
            settingValue: unknown;
            dataType: "string" | "number" | "boolean";
            updatedAt: string;
        }) => void;
        "settings:deleted": (p1: {
            settingKey: string;
        }) => void;
        "settings:error": (p1: {
            error: string;
        }) => void;
        "chat:messageChunk": (p1: {
            messageId: number;
            chunk: string;
        }) => void;
        "chat:messageComplete": (p1: {
            messageId: number;
            fullContent: string;
        }) => void;
        "chat:messageDeleted": (p1: {
            messageId: number;
        }) => void;
        "chat:chatError": (p1: {
            messageId?: number | undefined;
            error: string;
        }) => void;
        "prompts:promptCreated": (p1: {
            id: number;
            name: string;
            command: string;
            template: string;
            description?: string | undefined;
            isActive: boolean;
            isSystem: boolean;
            createdAt: string;
            updatedAt: string;
            userId: string;
        }) => void;
        "prompts:promptUpdated": (p1: {
            id: number;
            name?: string | undefined;
            command?: string | undefined;
            template?: string | undefined;
            description?: string | undefined;
            isActive?: boolean | undefined;
            isSystem?: boolean | undefined;
            updatedAt: string;
            userId: string;
        }) => void;
        "prompts:promptDeleted": (p1: {
            id: number;
            userId: string;
        }) => void;
        "subscription:messageLimitReached": (p1: {}) => void;
        "subscription:userTierChanged": (p1: {
            tier: "free" | "pro";
        }) => void;
        "subscription:checkoutSessionError": (p1: {
            error: string;
        }) => void;
    }
    export interface Actions {
        "settings:getAll": (cb1: (p1: {
            success: boolean;
            data: {
                settingKey: string;
                settingValue: unknown;
                dataType: "string" | "number" | "boolean";
                updatedAt: string;
                required: boolean;
                minLength?: number | undefined;
                maxLength?: number | undefined;
                minValue?: number | undefined;
                maxValue?: number | undefined;
                description: string;
                category: string;
                encrypted: boolean;
            }[];
            error?: string | undefined;
        }) => void) => void;
        "settings:upsert": (p1: {
            settingKey: string;
            settingValue: unknown;
            dataType: "string" | "number" | "boolean";
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        "settings:delete": (p1: {
            settingKey: string;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        "chat:sendMessage": (p1: {
            messageId: number;
            provider: string;
            modelId: string;
            messages: {
                role: "user" | "assistant" | "system";
                content: string;
            }[];
            systemPrompt?: string | undefined;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        "chat:abortMessage": (p1: {
            messageId: number;
            deleteMessage?: boolean | undefined;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        "models:listAllModels": (cb1: (p1: {
            success: boolean;
            models?: {
                openai: string[];
                anthropic: string[];
                gemini: string[];
            } | undefined;
            error?: string | undefined;
        }) => void) => void;
        "validation:validateApiKey": (p1: {
            provider: "openai" | "anthropic" | "google";
            apiKey: string;
        }, cb2: (p1: {
            type: "valid";
            provider: string;
            statusCode: number;
        } | {
            type: "recognized";
            provider: string;
            statusCode: number;
            reason: "bad_request" | "rate_limited";
        } | {
            type: "invalid_key";
            provider: string;
            statusCode: number;
        } | {
            type: "network_error";
            provider: string;
            cause: unknown;
        } | {
            type: "server_error";
            provider: string;
            statusCode: number;
        } | {
            type: "unsupported_provider";
            provider: string;
        }) => void) => void;
        "prompts:getPrompts": (cb1: (p1: {
            success: boolean;
            data: {
                id: number;
                name: string;
                command: string;
                template: string;
                description?: string | undefined;
                isActive: boolean;
                isSystem: boolean;
                createdAt: string;
                updatedAt: string;
            }[];
            error?: string | undefined;
        }) => void) => void;
        "prompts:createPrompt": (p1: {
            name: string;
            command: string;
            template: string;
            description?: string | undefined;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        "prompts:updatePrompt": (p1: {
            id: number;
            name?: string | undefined;
            command?: string | undefined;
            template?: string | undefined;
            description?: string | undefined;
            isActive?: boolean | undefined;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        "prompts:deletePrompt": (p1: {
            id: number;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        "prompts:getPrompt": (p1: {
            command: string;
        }, cb2: (p1: {
            success: boolean;
            template?: string | undefined;
            error?: string | undefined;
        }) => void) => void;
        "subscription:createCheckoutSession": (cb1: (p1: {
            success: boolean;
            checkoutUrl?: string | undefined;
            error?: string | undefined;
        }) => void) => void;
    }
    /** @example const socket: Root.Socket = io(Root.path) */
    export type Socket = SocketBase<Emission, Actions>;
}