import React, {useState} from "react";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import {Alert, Button, Link, TextField, Typography} from "@mui/material";
import {loginUser} from "./loginApi";
import type {Session} from "../model/common";
import {CustomError} from "../model/CustomError";
import {AuthLayout} from "../components/AuthLayout";
import {useSessionStore} from "../store/sessionStore";

export function Login() {

    const [error, setError] = useState("");
    const login = useSessionStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        loginUser({user_id: -1, username: data.get('login') as string, password: data.get('password') as string},
            (result: Session) => {
                login(result);
                navigate("/messages");
            }, (loginError: CustomError) => {
                setError(loginError.message || "Erreur de connexion");
            });
    };

    return (
        <AuthLayout title="Connexion">
            <form onSubmit={handleSubmit}>
                <TextField name="login" label="Login" fullWidth margin="normal" required/>
                <TextField name="password" label="Mot de passe" type="password" fullWidth margin="normal" required/>
                {error && <Alert severity="error" sx={{mt: 1}}>{error}</Alert>}
                <Button type="submit" variant="contained" size="large" fullWidth sx={{mt: 2}}>Se connecter</Button>
            </form>
            <Typography sx={{mt: 2, textAlign: "center"}}>
                Pas de compte ? <Link component={RouterLink} to="/register">Créer un compte</Link>
            </Typography>
        </AuthLayout>
    );
}
