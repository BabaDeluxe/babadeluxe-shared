import type { Socket as SocketBase } from "socket.io-client";

export namespace Settings {
    /** @desc The actual path of the Settings namespace */
    export const path = "/settings";
    export interface Emission {
        updated: (p1: {
            settingKey: string;
            settingValue: unknown;
            dataType: "string" | "number" | "boolean";
            updatedAt: string;
        }) => void;
        deleted: (p1: {
            settingKey: string;
        }) => void;
        error: (p1: {
            error: string;
        }) => void;
    }
    export interface Actions {
        getAll: (cb1: (p1: {
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
        upsert: (p1: {
            settingKey: string;
            settingValue: unknown;
            dataType: "string" | "number" | "boolean";
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        delete: (p1: {
            settingKey: string;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
    }
    /** @example const socket: Settings.Socket = io(Settings.path) */
    export type Socket = SocketBase<Emission, Actions>;
}

export namespace Chat {
    /** @desc The actual path of the Chat namespace */
    export const path = "/chat";
    export interface Emission {
        messageChunk: (p1: {
            messageId: number;
            chunk: string;
        }) => void;
        messageComplete: (p1: {
            messageId: number;
            fullContent: string;
        }) => void;
        messageDeleted: (p1: {
            messageId: number;
        }) => void;
        chatError: (p1: {
            messageId?: number | undefined;
            error: string;
        }) => void;
    }
    export interface Actions {
        sendMessage: (p1: {
            messageId: number;
            provider: string;
            modelId: string;
            prompt: string;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        abortMessage: (p1: {
            messageId: number;
            deleteMessage?: boolean | undefined;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
    }
    /** @example const socket: Chat.Socket = io(Chat.path) */
    export type Socket = SocketBase<Emission, Actions>;
}

export namespace Models {
    /** @desc The actual path of the Models namespace */
    export const path = "/models";
    export interface Emission {
    }
    export interface Actions {
        listAllModels: (cb1: (p1: {
            success: boolean;
            models?: {
                openai: string[];
                anthropic: string[];
                gemini: string[];
            } | undefined;
            error?: string | undefined;
        }) => void) => void;
    }
    /** @example const socket: Models.Socket = io(Models.path) */
    export type Socket = SocketBase<Emission, Actions>;
}

export namespace Validation {
    /** @desc The actual path of the Validation namespace */
    export const path = "/validation";
    export interface Emission {
    }
    export interface Actions {
        validateApiKey: (p1: {
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
    }
    /** @example const socket: Validation.Socket = io(Validation.path) */
    export type Socket = SocketBase<Emission, Actions>;
}

export namespace Prompts {
    /** @desc The actual path of the Prompts namespace */
    export const path = "/prompts";
    export interface Emission {
    }
    export interface Actions {
        getPrompts: (cb1: (p1: {
            success: boolean;
            data: {
                id: number;
                name: string;
                command: string;
                template: string;
                description?: string | undefined;
                isActive: boolean;
                createdAt: string;
                updatedAt: string;
            }[];
            error?: string | undefined;
        }) => void) => void;
        createPrompt: (p1: {
            name: string;
            command: string;
            template: string;
            description?: string | undefined;
        }, cb2: (p1: {
            success: boolean;
            data?: {
                id: number;
                name: string;
                command: string;
                template: string;
                description?: string | undefined;
            } | undefined;
            error?: string | undefined;
        }) => void) => void;
        updatePrompt: (p1: {
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
        deletePrompt: (p1: {
            id: number;
        }, cb2: (p1: {
            success: boolean;
            error?: string | undefined;
        }) => void) => void;
        getPrompt: (p1: {
            command: string;
        }, cb2: (p1: {
            success: boolean;
            template?: string | undefined;
            error?: string | undefined;
        }) => void) => void;
    }
    /** @example const socket: Prompts.Socket = io(Prompts.path) */
    export type Socket = SocketBase<Emission, Actions>;
}