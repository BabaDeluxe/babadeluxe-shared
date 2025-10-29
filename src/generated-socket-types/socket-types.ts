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