import React from "react";
import {useNavigate} from "react-router-dom";
import {List, ListItemButton, ListItemText, ListSubheader} from "@mui/material";
import {useChatStore} from "../store/chatStore";
import {useSessionStore} from "../store/sessionStore";

// Liste des utilisateurs à qui envoyer des messages
export function UserList() {

    const users = useChatStore((state) => state.users);
    const selectedUser = useChatStore((state) => state.selectedUser);
    const session = useSessionStore((state) => state.session);
    const navigate = useNavigate();

    // On n'affiche pas l'utilisateur connecté
    const otherUsers = users.filter((user) => user.user_id !== session?.id);

    return (
        <List subheader={<ListSubheader>Utilisateurs</ListSubheader>}>
            {otherUsers.map((user) => (
                <ListItemButton key={user.user_id}
                                selected={selectedUser?.user_id === user.user_id}
                                onClick={() => navigate("/messages/user/" + user.user_id)}>
                    <ListItemText primary={user.username}
                                  secondary={user.last_login ? "Vu le " + user.last_login : "Jamais connecté"}/>
                </ListItemButton>
            ))}
        </List>
    );
}
