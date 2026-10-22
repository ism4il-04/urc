import {getConnecterUser, triggerNotConnected} from "../lib/session.js";
import { Redis } from '@upstash/redis';
import {conversationKey, roomKey} from "../lib/conversation.js";

const redis = Redis.fromEnv();

// GET /api/messages?userId=X : messages échangés avec l'utilisateur X
// GET /api/messages?roomId=X : messages du salon X
export default async (request, response) => {
    try {
        const user = await getConnecterUser(request);
        if (user === undefined || user === null) {
            console.log("Not connected");
            triggerNotConnected(response);
            return;
        }

        const {userId, roomId} = request.query;
        const key = roomId ? roomKey(roomId) : conversationKey(user.id, userId);
        const messages = await redis.lrange(key, 0, -1);

        // LPUSH ajoute au début : on inverse pour avoir l'ordre chronologique
        response.status(200).json(messages.reverse());
    } catch (error) {
        console.log(error);
        response.status(500).json(error);
    }
};
