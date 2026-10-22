import React from "react";
import {useNavigate} from "react-router-dom";
import {List, ListItemButton, ListItemText, ListSubheader} from "@mui/material";
import {useChatStore} from "../store/chatStore";
import {useSessionStore} from "../store/sessionStore";

// Liste des salons et des utilisateurs à qui envoyer des messages
export function UserList() {

    const users = useChatStore((state) => state.users);
    const rooms = useChatStore((state) => state.rooms);
    const selectedChat = useChatStore((state) => state.selectedChat);
    const session = useSessionStore((state) => state.session);
    const navigate = useNavigate();

    // On n'affiche pas l'utilisateur connecté
    const otherUsers = users.filter((user) => user.user_id !== session?.id);

    return (
        <>
            <List subheader={<ListSubheader>Salons</ListSubheader>}>
                {rooms.map((room) => (
                    <ListItemButton key={room.room_id}
                                    selected={selectedChat?.type === "room" && selectedChat.id === room.room_id}
                                    onClick={() => navigate("/messages/room/" + room.room_id)}>
                        <ListItemText primary={"# " + room.name}/>
                    </ListItemButton>
                ))}
            </List>
            <List subheader={<ListSubheader>Utilisateurs</ListSubheader>}>
                {otherUsers.map((user) => (
                    <ListItemButton key={user.user_id}
                                    selected={selectedChat?.type === "user" && selectedChat.id === user.user_id}
                                    onClick={() => navigate("/messages/user/" + user.user_id)}>
                        <ListItemText primary={user.username}
                                      secondary={user.last_login ? "Vu le " + user.last_login : "Jamais connecté"}/>
                    </ListItemButton>
                ))}
            </List>
        </>
    );
}
