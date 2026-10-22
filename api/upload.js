import { put } from "@vercel/blob";
import {checkSession, unauthorizedResponse} from "../lib/session.js";


// POST /api/upload?filename=x.gif : enregistre l'image dans Vercel Blob et renvoie son URL
export async function POST(request) {
    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        const filename = new URL(request.url).searchParams.get("filename") || "image";
        const blob = await put("images/" + filename, request.body, {
            access: "public",
            addRandomSuffix: true,
        });

        return new Response(JSON.stringify({url: blob.url}), {
            status: 200,
            headers: {'content-type': 'application/json'},
        });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({code: "ERROR", message: "Erreur lors de l'envoi de l'image"}), {
            status: 500,
            headers: {'content-type': 'application/json'},
        });
    }
}
