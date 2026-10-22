import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {CssBaseline, ThemeProvider} from "@mui/material";
import './index.css';
import App from './App';
import {theme} from "./theme";
import reportWebVitals from './reportWebVitals';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <App />
        </ThemeProvider>
    </StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
