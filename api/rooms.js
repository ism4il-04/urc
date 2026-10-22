import { sql } from "@vercel/postgres";
import {checkSession, unauthorizedResponse} from "../lib/session";

export const config = {
    runtime: 'edge',
};

// GET /api/rooms : liste des salons
export default async function handler(request) {
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
};
