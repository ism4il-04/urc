import { sql } from "@vercel/postgres";
import {getConnecterUser, unauthorizedResponse} from "../lib/session.js";
import {arrayBufferToBase64, stringToArrayBuffer} from "../lib/base64.js";

function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), {
        status: status,
        headers: {'content-type': 'application/json'},
    });
}

// Même hash que login.js
async function hashPassword(username, password) {
    const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
    return arrayBufferToBase64(hash);
}

// GET /api/profile : infos de l'utilisateur connecté
export async function GET(request) {
    try {
        const user = await getConnecterUser(request);
        if (!user) {
            return unauthorizedResponse();
        }
        const {rows} = await sql`select username, email, avatar_url from users where user_id = ${user.id}`;
        return jsonResponse(200, rows[0]);
    } catch (error) {
        console.log(error);
        return jsonResponse(500, {code: "ERROR", message: "Erreur serveur"});
    }
}

// PUT /api/profile : modification {email, avatarUrl, currentPassword, newPassword}
export async function PUT(request) {
    try {
        const user = await getConnecterUser(request);
        if (!user) {
            return unauthorizedResponse();
        }
        const {email, avatarUrl, currentPassword, newPassword} = await request.json();

        // Email : obligatoire et pas déjà utilisé par quelqu'un d'autre
        if (!email) {
            return jsonResponse(400, {code: "BAD_REQUEST", message: "L'email est obligatoire"});
        }
        const {rowCount} = await sql`select user_id from users where email = ${email} and user_id <> ${user.id}`;
        if (rowCount > 0) {
            return jsonResponse(409, {code: "CONFLICT", message: "Cet email est déjà utilisé"});
        }

        // Mot de passe : on vérifie l'ancien avant de le changer
        if (newPassword) {
            const currentHash = await hashPassword(user.username, currentPassword || "");
            const {rowCount: ok} = await sql`select user_id from users where user_id = ${user.id} and password = ${currentHash}`;
            if (ok !== 1) {
                return jsonResponse(400, {code: "BAD_REQUEST", message: "Mot de passe actuel incorrect"});
            }
            const newHash = await hashPassword(user.username, newPassword);
            await sql`update users set password = ${newHash} where user_id = ${user.id}`;
        }

        const {rows} = await sql`update users set email = ${email}, avatar_url = ${avatarUrl || null}
                                 where user_id = ${user.id} returning username, email, avatar_url`;
        return jsonResponse(200, rows[0]);
    } catch (error) {
        console.log(error);
        return jsonResponse(500, {code: "ERROR", message: "Erreur serveur"});
    }
}
