import React from "react";
import {Box, Typography} from "@mui/material";
import {useChatStore} from "../store/chatStore";

// Affiche la conversation sélectionnée (les messages arriveront à l'étape suivante)
export function Conversation() {

    const selectedUser = useChatStore((state) => state.selectedUser);

    if (!selectedUser) {
        return (
            <Box sx={{p: 3}}>
                <Typography color="text.secondary">Sélectionne un utilisateur pour discuter</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{p: 3}}>
            <Typography variant="h6">{selectedUser.username}</Typography>
        </Box>
    );
}
