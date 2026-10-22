import React, {useEffect, useRef, useState} from "react";
import {Box, Button, Paper, TextField, Typography} from "@mui/material";
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
            <Box sx={{p: 3}}>
                <Typography color="text.secondary">Sélectionne un salon ou un utilisateur pour discuter</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{flexGrow: 1, minHeight: 0, display: "flex", flexDirection: "column"}}>
            <Typography variant="h6" sx={{p: 2, borderBottom: 1, borderColor: "divider"}}>
                {selectedChat.type === "room" ? "# " + selectedChat.name : selectedChat.name}
            </Typography>

            <Box sx={{flexGrow: 1, overflowY: "auto", p: 2, bgcolor: "#f5f5f5"}}>
                {messages.map((message, index) => {
                    const isMine = message.senderId === session?.id;
                    return (
                        <Box key={index} sx={{display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", mb: 1}}>
                            <Paper sx={{p: 1.5, maxWidth: "60%", bgcolor: isMine ? "primary.main" : "white", color: isMine ? "white" : "black"}}>
                                <Typography variant="caption" sx={{opacity: 0.8}}>
                                    {message.senderName} - {new Date(message.date).toLocaleString("fr-FR")}
                                </Typography>
                                {message.image &&
                                    <Box component="img" src={message.image} alt="image"
                                         sx={{display: "block", maxWidth: "100%", maxHeight: 300, borderRadius: 1, mt: 0.5}}
                                         onLoad={() => bottomRef.current?.scrollIntoView()}/>
                                }
                                {message.content &&
                                    <Typography sx={{whiteSpace: "pre-wrap"}}>{message.content}</Typography>
                                }
                            </Paper>
                        </Box>
                    );
                })}
                <div ref={bottomRef}/>
            </Box>

            <Box component="form" onSubmit={handleSend} sx={{display: "flex", p: 2, gap: 1, borderTop: 1, borderColor: "divider"}}>
                <TextField value={text} onChange={(e) => setText(e.target.value)}
                           placeholder="Écrire un message..." size="small" fullWidth autoComplete="off"/>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage}/>
                <Button variant="outlined" disabled={sending} onClick={() => fileRef.current?.click()}>
                    {sending ? "..." : "Image"}
                </Button>
                <Button type="submit" variant="contained" disabled={sending}>Envoyer</Button>
            </Box>
        </Box>
    );
}
