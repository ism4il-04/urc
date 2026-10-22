import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    Alert, Badge, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
    List, ListItemAvatar, ListItemButton, ListItemText, ListSubheader, TextField, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {chatKey, useChatStore} from "../store/chatStore";
import {useSessionStore} from "../store/sessionStore";
import {ChatAvatar} from "../components/ChatAvatar";
import {createRoom} from "./messagesApi";

const itemStyle = {mx: 1, borderRadius: 2, "&.Mui-selected": {bgcolor: "primary.light", color: "white"},
    "&.Mui-selected:hover": {bgcolor: "primary.main"}, "&.Mui-selected .MuiListItemText-secondary": {color: "white"}};
const headerStyle = {fontWeight: 700, textTransform: "uppercase", fontSize: 12, letterSpacing: 1,
    display: "flex", alignItems: "center", justifyContent: "space-between"};

// Liste des salons et des utilisateurs à qui envoyer des messages
export function UserList() {

    const users = useChatStore((state) => state.users);
    const rooms = useChatStore((state) => state.rooms);
    const unread = useChatStore((state) => state.unread);
    const selectedChat = useChatStore((state) => state.selectedChat);
    const addRoom = useChatStore((state) => state.addRoom);
    const session = useSessionStore((state) => state.session);
    const navigate = useNavigate();

    // Fenêtre de création de salon
    const [dialogOpen, setDialogOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [error, setError] = useState("");

    // On n'affiche pas l'utilisateur connecté
    const otherUsers = users.filter((user) => user.user_id !== session?.id);

    const closeDialog = () => {
        setDialogOpen(false);
        setRoomName("");
        setError("");
    };

    const handleCreateRoom = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!session) return;
        createRoom(session.token, roomName)
            .then((room) => {
                addRoom(room);
                closeDialog();
                navigate("/messages/room/" + room.room_id);
            })
            .catch((createError: Error) => setError(createError.message));
    };

    return (
        <>
            <List subheader={
                <ListSubheader sx={headerStyle}>
                    Salons
                    <Tooltip title="Créer un salon">
                        <IconButton size="small" onClick={() => setDialogOpen(true)}><AddIcon fontSize="small"/></IconButton>
                    </Tooltip>
                </ListSubheader>
            }>
                {rooms.map((room) => (
                    <ListItemButton key={room.room_id} sx={itemStyle}
                                    selected={selectedChat?.type === "room" && selectedChat.id === room.room_id}
                                    onClick={() => navigate("/messages/room/" + room.room_id)}>
                        <ListItemAvatar><ChatAvatar name={room.name} room/></ListItemAvatar>
                        <ListItemText primary={room.name}/>
                        <Badge badgeContent={unread[chatKey("room", room.room_id)]} color="error" sx={{mr: 1}}/>
                    </ListItemButton>
                ))}
            </List>
            <List subheader={<ListSubheader sx={headerStyle}>Utilisateurs</ListSubheader>}>
                {otherUsers.map((user) => (
                    <ListItemButton key={user.user_id} sx={itemStyle}
                                    selected={selectedChat?.type === "user" && selectedChat.id === user.user_id}
                                    onClick={() => navigate("/messages/user/" + user.user_id)}>
                        <ListItemAvatar><ChatAvatar name={user.username} src={user.avatar_url}/></ListItemAvatar>
                        <ListItemText primary={user.username}
                                      secondary={user.last_login ? "Vu le " + user.last_login : "Jamais connecté"}/>
                        <Badge badgeContent={unread[chatKey("user", user.user_id)]} color="error" sx={{mr: 1}}/>
                    </ListItemButton>
                ))}
            </List>

            <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
                <form onSubmit={handleCreateRoom}>
                    <DialogTitle>Nouveau salon</DialogTitle>
                    <DialogContent>
                        <TextField value={roomName} onChange={(e) => setRoomName(e.target.value)}
                                   label="Nom du salon" fullWidth autoFocus margin="dense"
                                   slotProps={{htmlInput: {maxLength: 50}}}/>
                        {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialog}>Annuler</Button>
                        <Button type="submit" variant="contained" disabled={roomName.trim() === ""}>Créer</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}
