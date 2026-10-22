import React from "react";
import {Avatar} from "@mui/material";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

// Même nom => même couleur
function colorFor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}

// Avatar : photo de profil si elle existe, sinon l'initiale du nom (ou # pour un salon)
export function ChatAvatar({name, src, room = false, size = 40}: {name: string, src?: string | null, room?: boolean, size?: number}) {
    return (
        <Avatar variant={room ? "rounded" : "circular"} src={src || undefined} alt={name}
                sx={{bgcolor: colorFor(name), width: size, height: size, fontSize: size * 0.45, fontWeight: 600}}>
            {room ? "#" : name.charAt(0).toUpperCase()}
        </Avatar>
    );
}
