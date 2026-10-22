import React from "react";
import {useNavigate} from "react-router-dom";
import {List, ListItemAvatar, ListItemButton, ListItemText, ListSubheader} from "@mui/material";
import {useChatStore} from "../store/chatStore";
import {useSessionStore} from "../store/sessionStore";
import {ChatAvatar} from "../components/ChatAvatar";

const itemStyle = {mx: 1, borderRadius: 2, "&.Mui-selected": {bgcolor: "primary.light", color: "white"},
    "&.Mui-selected:hover": {bgcolor: "primary.main"}, "&.Mui-selected .MuiListItemText-secondary": {color: "white"}};
const headerStyle = {fontWeight: 700, textTransform: "uppercase", fontSize: 12, letterSpacing: 1};

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
            <List subheader={<ListSubheader sx={headerStyle}>Salons</ListSubheader>}>
                {rooms.map((room) => (
                    <ListItemButton key={room.room_id} sx={itemStyle}
                                    selected={selectedChat?.type === "room" && selectedChat.id === room.room_id}
                                    onClick={() => navigate("/messages/room/" + room.room_id)}>
                        <ListItemAvatar><ChatAvatar name={room.name} room/></ListItemAvatar>
                        <ListItemText primary={room.name}/>
                    </ListItemButton>
                ))}
            </List>
            <List subheader={<ListSubheader sx={headerStyle}>Utilisateurs</ListSubheader>}>
                {otherUsers.map((user) => (
                    <ListItemButton key={user.user_id} sx={itemStyle}
                                    selected={selectedChat?.type === "user" && selectedChat.id === user.user_id}
                                    onClick={() => navigate("/messages/user/" + user.user_id)}>
                        <ListItemAvatar><ChatAvatar name={user.username}/></ListItemAvatar>
                        <ListItemText primary={user.username}
                                      secondary={user.last_login ? "Vu le " + user.last_login : "Jamais connecté"}/>
                    </ListItemButton>
                ))}
            </List>
        </>
    );
}
