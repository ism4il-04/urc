import { sql } from "@vercel/postgres";
import {checkSession, getConnecterUser, unauthorizedResponse} from "../lib/session.js";


// GET /api/rooms : liste des salons
export async function GET(request) {
    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        const {rows} = await sql`select room_id, name from rooms order by name`;
        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: {'content-type': 'application/json'},
        });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: {'content-type': 'application/json'},
        });
    }
}

function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), {
        status: status,
        headers: {'content-type': 'application/json'},
    });
}

// POST /api/rooms : création d'un salon {name}
export async function POST(request) {
    try {
        const user = await getConnecterUser(request);
        if (!user) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        const {name} = await request.json();
        const roomName = (name || "").trim();
        if (roomName === "" || roomName.length > 50) {
            return jsonResponse(400, {code: "BAD_REQUEST", message: "Le nom doit faire entre 1 et 50 caractères"});
        }

        const {rowCount} = await sql`select room_id from rooms where lower(name) = lower(${roomName})`;
        if (rowCount > 0) {
            return jsonResponse(409, {code: "CONFLICT", message: "Ce salon existe déjà"});
        }

        const {rows} = await sql`insert into rooms (name, created_on, created_by)
                                 values (${roomName}, now(), ${user.id}) returning room_id, name`;
        return jsonResponse(200, rows[0]);
    } catch (error) {
        console.log(error);
        return jsonResponse(500, {code: "ERROR", message: "Erreur serveur"});
    }
}
