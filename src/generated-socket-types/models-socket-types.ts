import type { Socket as SocketBase } from "socket.io-client";

export namespace Root {
    /** @desc The actual path of the Root namespace */
    export const path = "/";
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
    /** @example const socket: Root.Socket = io(Root.path) */
    export type Socket = SocketBase<Emission, Actions>;
}