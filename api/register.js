import { db } from '@vercel/postgres';
import {arrayBufferToBase64, stringToArrayBuffer} from "../lib/base64";

export const config = {
    runtime: 'edge',
};

function errorResponse(status, code, message) {
    return new Response(JSON.stringify({code, message}), {
        status: status,
        headers: {'content-type': 'application/json'},
    });
}

export default async function handler(request) {
    try {
        const {username, email, password} = await request.json();

        // 1. Tous les champs sont obligatoires
        if (!username || !email || !password) {
            return errorResponse(400, "BAD_REQUEST", "Tous les champs sont obligatoires");
        }

        // 2. Vérifier que le username et l'email ne sont pas déjà utilisés
        const client = await db.connect();
        const {rowCount} = await client.sql`select user_id from users where username = ${username} or email = ${email}`;
        if (rowCount > 0) {
            return errorResponse(409, "CONFLICT", "Ce login ou cet email est déjà utilisé");
        }

        // 3. Hasher le mot de passe (même méthode que login.js)
        const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
        const hashed64 = arrayBufferToBase64(hash);

        // 4. Générer un identifiant externe
        const externalId = crypto.randomUUID().toString();

        // 5. Enregistrer en base
        await client.sql`insert into users (username, password, email, created_on, external_id)
                         values (${username}, ${hashed64}, ${email}, now(), ${externalId})`;

        return new Response(JSON.stringify({username, externalId}), {
            status: 200,
            headers: {'content-type': 'application/json'},
        });
    } catch (error) {
        console.log(error);
        return errorResponse(500, "ERROR", "Erreur serveur");
    }
}
