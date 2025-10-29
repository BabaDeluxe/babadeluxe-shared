import type { Socket as SocketBase } from "socket.io-client";

export namespace Root {
    /** @desc The actual path of the Root namespace */
    export const path = "/";
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
    }
    /** @example const socket: Root.Socket = io(Root.path) */
    export type Socket = SocketBase<Emission, Actions>;
}