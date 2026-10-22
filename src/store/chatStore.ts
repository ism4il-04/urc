import {create} from "zustand";
import type {Chat, Message, Room, User} from "../model/common";

interface ChatState {
    users: User[];
    rooms: Room[];
    selectedChat: Chat | null;
    messages: Message[];
    unread: Record<string, number>;   // nombre de messages non lus, par clé "user:2" ou "room:1"
    setUsers: (users: User[]) => void;
    setRooms: (rooms: Room[]) => void;
    setSelectedChat: (chat: Chat | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    addRoom: (room: Room) => void;
    incrementUnread: (key: string) => void;
    clearUnread: (key: string) => void;
}

// Clé d'une conversation dans le compteur de non lus
export function chatKey(type: "user" | "room", id: number) {
    return type + ":" + id;
}

export const useChatStore = create<ChatState>((set) => ({
    users: [],
    rooms: [],
    selectedChat: null,
    messages: [],
    unread: {},
    setUsers: (users) => set({users}),
    setRooms: (rooms) => set({rooms}),
    setSelectedChat: (chat) => set({selectedChat: chat}),
    setMessages: (messages) => set({messages}),
    addMessage: (message) => set((state) => ({messages: [...state.messages, message]})),
    addRoom: (room) => set((state) => ({rooms: [...state.rooms, room].sort((a, b) => a.name.localeCompare(b.name))})),
    incrementUnread: (key) => set((state) => ({unread: {...state.unread, [key]: (state.unread[key] || 0) + 1}})),
    clearUnread: (key) => set((state) => ({unread: {...state.unread, [key]: 0}})),
}));
