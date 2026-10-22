import React from "react";
import {Avatar, Box, Paper, Typography} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

// Mise en page commune aux pages connexion / inscription
export function AuthLayout({title, children}: {title: string, children: React.ReactNode}) {
    return (
        <Box sx={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2,
            background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
        }}>
            <Paper elevation={8} sx={{p: 4, width: "100%", maxWidth: 400}}>
                <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", mb: 2}}>
                    <Avatar sx={{bgcolor: "primary.main", width: 56, height: 56, mb: 1}}>
                        <ChatIcon/>
                    </Avatar>
                    <Typography variant="h5" sx={{fontWeight: 700}}>UBO Relay Chat</Typography>
                    <Typography color="text.secondary">{title}</Typography>
                </Box>
                {children}
            </Paper>
        </Box>
    );
}
