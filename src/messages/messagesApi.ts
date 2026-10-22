import {AUTHENT_HEADER, BEARER} from "../model/common";
import type {Chat, Message, Profile, Room, User} from "../model/common";

// Erreur levée quand le token de session n'est plus valide
export class UnauthorizedError extends Error {}

async function callApi<T>(url: string, token: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            [AUTHENT_HEADER]: BEARER + token,
        },
    });
    if (response.status === 401) {
        throw new UnauthorizedError();
    }
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Erreur " + response.status);
    }
    return await response.json() as T;
}

export function fetchUsers(token: string): Promise<User[]> {
    return callApi<User[]>("/api/users", token);
}

export function fetchProfile(token: string): Promise<Profile> {
    return callApi<Profile>("/api/profile", token);
}

export interface ProfileUpdate {
    email: string;
    avatarUrl: string | null;
    currentPassword?: string;
    newPassword?: string;
}

export function updateProfile(token: string, update: ProfileUpdate): Promise<Profile> {
    return callApi<Profile>("/api/profile", token, {
        method: "PUT",
        body: JSON.stringify(update),
    });
}

export function fetchRooms(token: string): Promise<Room[]> {
    return callApi<Room[]>("/api/rooms", token);
}

export function createRoom(token: string, name: string): Promise<Room> {
    return callApi<Room>("/api/rooms", token, {
        method: "POST",
        body: JSON.stringify({name}),
    });
}

export function fetchMessages(token: string, chat: Chat): Promise<Message[]> {
    const param = chat.type === "room" ? "roomId=" : "userId=";
    return callApi<Message[]>("/api/messages?" + param + chat.id, token);
}

export function sendMessage(token: string, chat: Chat, content: string, image?: string): Promise<Message> {
    const target = chat.type === "room" ? {roomId: chat.id} : {receiverId: chat.id};
    return callApi<Message>("/api/message", token, {
        method: "POST",
        body: JSON.stringify({...target, content, image}),
    });
}

// Envoie le fichier à Vercel Blob et renvoie son URL
export async function uploadImage(token: string, file: File): Promise<string> {
    const response = await fetch("/api/upload?filename=" + encodeURIComponent(file.name), {
        method: "POST",
        headers: {
            "Content-Type": file.type,
            [AUTHENT_HEADER]: BEARER + token,
        },
        body: file,
    });
    if (response.status === 401) {
        throw new UnauthorizedError();
    }
    if (!response.ok) {
        throw new Error("Erreur " + response.status);
    }
    const {url} = await response.json() as {url: string};
    return url;
}
