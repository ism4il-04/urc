import React, {useState} from "react";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import {Alert, Box, Button, Link, Paper, TextField, Typography} from "@mui/material";
import {registerUser} from "./registerApi";
import {CustomError} from "../model/CustomError";

export function Register() {

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        registerUser({
                username: data.get('login') as string,
                email: data.get('email') as string,
                password: data.get('password') as string,
            },
            () => navigate("/login"),
            (registerError: CustomError) => setError(registerError.message || "Erreur lors de l'inscription"));
    };

    return (
        <Box sx={{display: "flex", justifyContent: "center", mt: 10}}>
            <Paper sx={{p: 4, width: 350}}>
                <Typography variant="h5" gutterBottom>Inscription</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField name="login" label="Login" fullWidth margin="normal" required/>
                    <TextField name="email" label="Email" type="email" fullWidth margin="normal" required/>
                    <TextField name="password" label="Mot de passe" type="password" fullWidth margin="normal" required/>
                    {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}
                    <Button type="submit" variant="contained" fullWidth sx={{mt: 2}}>Créer le compte</Button>
                </form>
                <Typography sx={{mt: 2}}>
                    Déjà inscrit ? <Link component={RouterLink} to="/login">Se connecter</Link>
                </Typography>
            </Paper>
        </Box>
    );
}
