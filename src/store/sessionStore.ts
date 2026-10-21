import {create} from "zustand";
import type {Session} from "../model/common";

// Lecture de la session sauvegardée (pour survivre à un F5)
function loadSession(): Session | null {
    const saved = sessionStorage.getItem("session");
    return saved ? JSON.parse(saved) as Session : null;
}

interface SessionState {
    session: Session | null;
    login: (session: Session) => void;
    logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    session: loadSession(),
    login: (session) => {
        sessionStorage.setItem("session", JSON.stringify(session));
        set({session});
    },
    logout: () => {
        sessionStorage.removeItem("session");
        set({session: null});
    },
}));
