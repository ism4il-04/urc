import {getConnecterUser, triggerNotConnected} from "../lib/session.js";
import { Redis } from '@upstash/redis';
import { sql } from "@vercel/postgres";
import PushNotifications from "@pusher/push-notifications-server";
import {conversationKey, roomKey} from "../lib/conversation.js";

const redis = Redis.fromEnv();

// Envoie une notification Push au destinataire (ou à tous les membres du salon)
async function notify(request, message) {
    let externalIds;
    let path;
    let title;
    if (message.roomId) {
        // Salon : tout le monde sauf l'émetteur
        const {rows} = await sql`select external_id from users where user_id <> ${message.senderId}`;
        const {rows: rooms} = await sql`select name from rooms where room_id = ${message.roomId}`;
        externalIds = rows.map((row) => row.external_id);
        path = "/messages/room/" + message.roomId;
        title = message.senderName + " #" + (rooms[0]?.name || "salon");
    } else {
        const {rows} = await sql`select external_id from users where user_id = ${message.receiverId}`;
        externalIds = rows.map((row) => row.external_id);
        path = "/messages/user/" + message.senderId;
        title = message.senderName;
    }
    if (externalIds.length === 0) return;

    const beamsClient = new PushNotifications({
        instanceId: process.env.PUSHER_INSTANCE_ID,
        secretKey: process.env.PUSHER_SECRET_KEY,
    });
    const protocol = request.headers["x-forwarded-proto"] || "http";

    await beamsClient.publishToUsers(externalIds, {
        web: {
            notification: {
                title: title,
                body: message.content || "📷 Image",
                ico: "https://www.univ-brest.fr/themes/custom/ubo_parent/favicon.ico",
                deep_link: protocol + "://" + request.headers.host + path,
            },
            data: {
                senderId: message.senderId,
                roomId: message.roomId,
            },
        },
    });
}

export default async (request, response) => {
    try {
        const user = await getConnecterUser(request);
        if (user === undefined || user === null) {
            console.log("Not connected");
            triggerNotConnected(response);
            return;
        }

        // receiverId pour un message privé, roomId pour un salon ; content et/ou image
        const {receiverId, roomId, content, image} = await request.body;
        if ((!receiverId && !roomId) || (!content && !image)) {
            response.status(400).json({code: "BAD_REQUEST", message: "Message vide"});
            return;
        }

        const message = {
            senderId: user.id,
            senderName: user.username,
            content: content || "",
            image: image,
            date: new Date().toISOString(),
        };
        if (roomId) {
            message.roomId = Number(roomId);
        } else {
            message.receiverId = Number(receiverId);
        }

        // Enregistrement en cache pendant 24h
        const key = roomId ? roomKey(roomId) : conversationKey(user.id, receiverId);
        await redis.lpush(key, message);
        await redis.expire(key, 24 * 3600);

        // Si la notification échoue, le message est quand même enregistré
        try {
            await notify(request, message);
        } catch (error) {
            console.log("Push error : " + error);
        }

        response.status(200).json(message);
    } catch (error) {
        console.log(error);
        response.status(500).json(error);
    }
};
