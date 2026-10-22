import React, {useEffect, useRef, useState} from "react";
import {Box, CircularProgress, IconButton, Paper, TextField, Tooltip, Typography} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import ForumIcon from "@mui/icons-material/Forum";
import {ChatAvatar} from "../components/ChatAvatar";
import {useChatStore} from "../store/chatStore";
import {useSessionStore} from "../store/sessionStore";
import {fetchMessages, sendMessage, uploadImage} from "./messagesApi";
import type {Message} from "../model/common";

// Affiche les messages de la conversation sélectionnée (utilisateur ou salon)
export function Conversation() {

    const session = useSessionStore((state) => state.session);
    const selectedChat = useChatStore((state) => state.selectedChat);
    const messages = useChatStore((state) => state.messages);
    const setMessages = useChatStore((state) => state.setMessages);
    const addMessage = useChatStore((state) => state.addMessage);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Chargement des messages quand on change de conversation
    useEffect(() => {
        setMessages([]);
        if (session && selectedChat) {
            fetchMessages(session.token, selectedChat).then(setMessages).catch(console.log);
        }
    }, [selectedChat]);

    // Auto-scroll vers le dernier message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!session || !selectedChat || text.trim() === "") return;
        const content = text.trim();

        // On affiche le message tout de suite, sans attendre la réponse du serveur
        const tempMessage: Message = {
            senderId: session.id!,
            senderName: session.username || "",
            content: content,
            date: new Date().toISOString(),
        };
        addMessage(tempMessage);
        setText("");

        sendMessage(session.token, selectedChat, content)
            .catch((error) => {
                // En cas d'échec : on retire le message et on remet le texte
                console.log(error);
                setMessages(useChatStore.getState().messages.filter((m) => m !== tempMessage));
                setText(content);
            });
    };

    // Choix d'une image : upload vers Vercel Blob puis envoi du message avec son URL
    const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!session || !selectedChat || !file) return;
        setSending(true);
        uploadImage(session.token, file)
            .then((url) => sendMessage(session.token, selectedChat, text.trim(), url))
            .then((message) => {
                addMessage(message);
                setText("");
            })
            .catch(console.log)
            .finally(() => setSending(false));
    };

    if (!selectedChat) {
        return (
            <Box sx={{flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "text.secondary"}}>
                <ForumIcon sx={{fontSize: 80, opacity: 0.3, mb: 2}}/>
                <Typography variant="h6">Bienvenue sur UBO Relay Chat</Typography>
                <Typography>Sélectionne un salon ou un utilisateur pour discuter</Typography>
            </Box>
        );
    }

    const isRoom = selectedChat.type === "room";

    return (
        <Box sx={{flexGrow: 1, minHeight: 0, display: "flex", flexDirection: "column"}}>
            <Box sx={{display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, bgcolor: "white", borderBottom: 1, borderColor: "divider"}}>
                <ChatAvatar name={selectedChat.name} room={isRoom}/>
                <Typography variant="h6" sx={{fontWeight: 600}}>{selectedChat.name}</Typography>
            </Box>

            <Box sx={{flexGrow: 1, overflowY: "auto", p: 2, bgcolor: "background.default"}}>
                {messages.map((message, index) => {
                    const isMine = message.senderId === session?.id;
                    return (
                        <Box key={index} sx={{display: "flex", alignItems: "flex-end", gap: 1, mb: 1.5,
                            justifyContent: isMine ? "flex-end" : "flex-start"}}>
                            {!isMine && <ChatAvatar name={message.senderName} size={32}/>}
                            <Paper elevation={0} sx={{
                                px: 1.5, py: 1, maxWidth: "65%",
                                bgcolor: isMine ? "primary.main" : "white",
                                color: isMine ? "white" : "text.primary",
                                borderRadius: 3,
                                borderBottomRightRadius: isMine ? 4 : undefined,
                                borderBottomLeftRadius: isMine ? undefined : 4,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                            }}>
                                {!isMine &&
                                    <Typography variant="caption" color="primary" sx={{fontWeight: 700}}>{message.senderName}</Typography>
                                }
                                {message.image &&
                                    <Box component="img" src={message.image} alt="image"
                                         sx={{display: "block", maxWidth: "100%", maxHeight: 300, borderRadius: 2, mt: 0.5}}
                                         onLoad={() => bottomRef.current?.scrollIntoView()}/>
                                }
                                {message.content &&
                                    <Typography sx={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>{message.content}</Typography>
                                }
                                <Typography variant="caption" sx={{display: "block", textAlign: "right", opacity: 0.7, fontSize: 11}}>
                                    {new Date(message.date).toLocaleString("fr-FR", {day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"})}
                                </Typography>
                            </Paper>
                        </Box>
                    );
                })}
                <div ref={bottomRef}/>
            </Box>

            <Box component="form" onSubmit={handleSend}
                 sx={{display: "flex", alignItems: "center", px: 2, py: 1.5, gap: 1, bgcolor: "white", borderTop: 1, borderColor: "divider"}}>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage}/>
                <Tooltip title="Envoyer une image">
                    <span>
                        <IconButton color="primary" disabled={sending} onClick={() => fileRef.current?.click()}>
                            {sending ? <CircularProgress size={24}/> : <ImageIcon/>}
                        </IconButton>
                    </span>
                </Tooltip>
                <TextField value={text} onChange={(e) => setText(e.target.value)}
                           placeholder={"Message " + (isRoom ? "#" : "à ") + selectedChat.name + "..."}
                           size="small" fullWidth autoComplete="off"
                           sx={{"& .MuiOutlinedInput-root": {borderRadius: 6, bgcolor: "background.default"}}}/>
                <IconButton type="submit" color="primary" disabled={sending || text.trim() === ""}
                            sx={{bgcolor: "primary.main", color: "white", "&:hover": {bgcolor: "primary.dark"}}}>
                    <SendIcon/>
                </IconButton>
            </Box>
        </Box>
    );
}
