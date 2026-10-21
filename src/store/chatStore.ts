import {create} from "zustand";
import type {User} from "../model/common";

interface ChatState {
    users: User[];
    selectedUser: User | null;
    setUsers: (users: User[]) => void;
    setSelectedUser: (user: User | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    users: [],
    selectedUser: null,
    setUsers: (users) => set({users}),
    setSelectedUser: (user) => set({selectedUser: user}),
}));
