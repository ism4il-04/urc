import {createTheme} from "@mui/material/styles";

// Thème commun à toute l'application
export const theme = createTheme({
    palette: {
        primary: {main: "#4f46e5"},
        secondary: {main: "#0ea5e9"},
        background: {default: "#f1f5f9"},
    },
    shape: {borderRadius: 12},
    typography: {
        fontFamily: "'Inter', 'Roboto', sans-serif",
        button: {textTransform: "none", fontWeight: 600},
    },
});
