import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Alert, Box, Button, CircularProgress, Divider, IconButton, Paper, TextField, Typography} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {ChatAvatar} from "../components/ChatAvatar";
import {useSessionStore} from "../store/sessionStore";
import {fetchProfile, updateProfile, uploadImage, UnauthorizedError} from "../messages/messagesApi";

// Page profil : photo, email et mot de passe
export function Profile() {

    const session = useSessionStore((state) => state.session);
    const logout = useSessionStore((state) => state.logout);
    const navigate = useNavigate();
    const fileRef = useRef<HTMLInputElement>(null);

    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleError = (err: Error) => {
        if (err instanceof UnauthorizedError) {
            logout();
            navigate("/login");
        } else {
            setError(err.message);
        }
    };

    // Chargement du profil
    useEffect(() => {
        if (!session) return;
        fetchProfile(session.token)
            .then((profile) => {
                setEmail(profile.email);
                setAvatarUrl(profile.avatar_url);
            })
            .catch(handleError);
    }, [session]);

    // Nouvelle photo : upload vers Vercel Blob (elle sera enregistrée au clic sur "Enregistrer")
    const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!session || !file) return;
        setUploading(true);
        uploadImage(session.token, file)
            .then(setAvatarUrl)
            .catch(handleError)
            .finally(() => setUploading(false));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!session) return;
        setError("");
        setSuccess("");
        updateProfile(session.token, {email, avatarUrl, currentPassword, newPassword: newPassword || undefined})
            .then(() => {
                setSuccess("Profil enregistré");
                setCurrentPassword("");
                setNewPassword("");
            })
            .catch(handleError);
    };

    return (
        <Box sx={{minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start", p: 2, pt: {xs: 2, sm: 6}}}>
            <Paper sx={{p: 4, width: "100%", maxWidth: 450}}>
                <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                    <IconButton onClick={() => navigate("/messages")}><ArrowBackIcon/></IconButton>
                    <Typography variant="h5" sx={{fontWeight: 700, ml: 1}}>Mon profil</Typography>
                </Box>

                <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", mb: 2}}>
                    <ChatAvatar name={session?.username || "?"} src={avatarUrl} size={100}/>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto}/>
                    <Box sx={{display: "flex", gap: 1, mt: 1.5}}>
                        <Button size="small" startIcon={uploading ? <CircularProgress size={16}/> : <PhotoCameraIcon/>}
                                disabled={uploading} onClick={() => fileRef.current?.click()}>
                            Changer la photo
                        </Button>
                        {avatarUrl &&
                            <Button size="small" color="error" onClick={() => setAvatarUrl(null)}>Supprimer</Button>
                        }
                    </Box>
                </Box>

                <form onSubmit={handleSubmit}>
                    <TextField label="Login" value={session?.username || ""} fullWidth margin="normal" disabled
                               helperText="Le login ne peut pas être modifié"/>
                    <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                               fullWidth margin="normal" required/>

                    <Divider sx={{my: 2}}>Changer le mot de passe (optionnel)</Divider>
                    <TextField label="Mot de passe actuel" type="password" value={currentPassword}
                               onChange={(e) => setCurrentPassword(e.target.value)}
                               fullWidth margin="normal" required={newPassword !== ""}/>
                    <TextField label="Nouveau mot de passe" type="password" value={newPassword}
                               onChange={(e) => setNewPassword(e.target.value)} fullWidth margin="normal"/>

                    {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{mt: 1}}>{success}</Alert>}
                    <Button type="submit" variant="contained" size="large" fullWidth sx={{mt: 2}} disabled={uploading}>
                        Enregistrer
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}
