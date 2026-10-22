import {create} from "zustand";
import type {Chat, Message, Room, User} from "../model/common";

interface ChatState {
    users: User[];
    rooms: Room[];
    selectedChat: Chat | null;
    messages: Message[];
    setUsers: (users: User[]) => void;
    setRooms: (rooms: Room[]) => void;
    setSelectedChat: (chat: Chat | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    users: [],
    rooms: [],
    selectedChat: null,
    messages: [],
    setUsers: (users) => set({users}),
    setRooms: (rooms) => set({rooms}),
    setSelectedChat: (chat) => set({selectedChat: chat}),
    setMessages: (messages) => set({messages}),
    addMessage: (message) => set((state) => ({messages: [...state.messages, message]})),
}));
