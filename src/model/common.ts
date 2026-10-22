import {CustomError} from "./CustomError";

export const AUTHENT_HEADER = "Authorization";
export const BEARER = "Bearer ";

export interface User {
    user_id: number;
    username: string;
    email?: string;
    password: string;
    last_login?: string;
    external_id?: string;
}

export interface Session {
    token: string;
    username?: string;
    id?: number;
    externalId: string;
}


export interface Room {
    room_id: number;
    name: string;
}

// Conversation sélectionnée : un utilisateur ou un salon
export interface Chat {
    type: "user" | "room";
    id: number;
    name: string;
}

export interface Message {
    senderId: number;
    senderName: string;
    receiverId?: number;
    roomId?: number;
    content: string;
    image?: string;
    date: string;
}

export interface EmptyCallback {
    (): void;
}

export interface SessionCallback {
    (session: Session): void;
}


export interface ErrorCallback {
    (error: CustomError): void;
}

