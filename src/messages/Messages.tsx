import React, {useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {AppBar, Box, Button, Paper, Toolbar, Typography} from "@mui/material";
import {useSessionStore} from "../store/sessionStore";
import {useChatStore} from "../store/chatStore";
import {fetchUsers, UnauthorizedError} from "./messagesApi";
import {UserList} from "./UserList";
import {Conversation} from "./Conversation";

// Page principale : gère l'état global de la messagerie
export function Messages() {

    const session = useSessionStore((state) => state.session);
    const logout = useSessionStore((state) => state.logout);
    const users = useChatStore((state) => state.users);
    const setUsers = useChatStore((state) => state.setUsers);
    const setSelectedUser = useChatStore((state) => state.setSelectedUser);
    const navigate = useNavigate();
    const {userId} = useParams();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Chargement de la liste des utilisateurs
    useEffect(() => {
        if (!session) return;
        fetchUsers(session.token)
            .then(setUsers)
            .catch((error) => {
                if (error instanceof UnauthorizedError) {
                    handleLogout();
                } else {
                    console.log(error);
                }
            });
    }, [session]);

    // L'URL /messages/user/{id} détermine la conversation sélectionnée
    useEffect(() => {
        const user = users.find((u) => String(u.user_id) === userId);
        setSelectedUser(user || null);
    }, [userId, users]);

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
                <Box sx={{flexGrow: 1}}>
                    <Conversation/>
                </Box>
            </Box>
        </Box>
    );
}
