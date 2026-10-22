import React, {useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {AppBar, Box, Button, Paper, Toolbar, Typography} from "@mui/material";
import {useSessionStore} from "../store/sessionStore";
import {useChatStore} from "../store/chatStore";
import {fetchMessages, fetchRooms, fetchUsers, UnauthorizedError} from "./messagesApi";
import {startNotifications, stopNotifications} from "./notifications";
import {UserList} from "./UserList";
import {Conversation} from "./Conversation";

// Page principale : gère l'état global de la messagerie
export function Messages() {

    const session = useSessionStore((state) => state.session);
    const logout = useSessionStore((state) => state.logout);
    const users = useChatStore((state) => state.users);
    const rooms = useChatStore((state) => state.rooms);
    const setUsers = useChatStore((state) => state.setUsers);
    const setRooms = useChatStore((state) => state.setRooms);
    const setSelectedChat = useChatStore((state) => state.setSelectedChat);
    const navigate = useNavigate();
    const {userId, roomId} = useParams();

    const handleLogout = () => {
        stopNotifications();
        logout();
        navigate("/login");
    };

    // Chargement de la liste des utilisateurs et des salons
    useEffect(() => {
        if (!session) return;
        Promise.all([fetchUsers(session.token), fetchRooms(session.token)])
            .then(([users, rooms]) => {
                setUsers(users);
                setRooms(rooms);
            })
            .catch((error) => {
                if (error instanceof UnauthorizedError) {
                    handleLogout();
                } else {
                    console.log(error);
                }
            });
    }, [session]);

    // Notifications Push + écoute du service worker
    useEffect(() => {
        if (!session) return;
        startNotifications(session);

        const sw = navigator.serviceWorker;
        if (sw != null) {
            sw.onmessage = (event) => {
                console.log("Got event from sw : " + JSON.stringify(event.data));
                // Si le message concerne la conversation ouverte, on recharge les messages
                const selected = useChatStore.getState().selectedChat;
                const data = event.data || {};
                const isOpen = selected && (data.roomId
                    ? selected.type === "room" && selected.id === data.roomId
                    : selected.type === "user" && selected.id === data.senderId);
                if (selected && isOpen) {
                    fetchMessages(session.token, selected)
                        .then(useChatStore.getState().setMessages)
                        .catch(console.log);
                }
            };
        }
    }, [session]);

    // L'URL /messages/user/{id} ou /messages/room/{id} détermine la conversation sélectionnée
    useEffect(() => {
        const user = users.find((u) => String(u.user_id) === userId);
        const room = rooms.find((r) => String(r.room_id) === roomId);
        if (user) {
            setSelectedChat({type: "user", id: user.user_id, name: user.username});
        } else if (room) {
            setSelectedChat({type: "room", id: room.room_id, name: room.name});
        } else {
            setSelectedChat(null);
        }
    }, [userId, roomId, users, rooms]);

    return (
        <Box sx={{height: "100vh", display: "flex", flexDirection: "column"}}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{flexGrow: 1}}>UBO Relay Chat</Typography>
                    <Typography sx={{mr: 2}}>{session?.username}</Typography>
                    <Button color="inherit" onClick={handleLogout}>Déconnexion</Button>
                </Toolbar>
            </AppBar>
            <Box sx={{flexGrow: 1, display: "flex", overflow: "hidden"}}>
                <Paper square sx={{width: 280, overflowY: "auto"}}>
                    <UserList/>
                </Paper>
                <Box sx={{flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0}}>
                    <Conversation/>
                </Box>
            </Box>
        </Box>
    );
}
