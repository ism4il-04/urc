import {Client, TokenProvider} from "@pusher/push-notifications-web";
import {AUTHENT_HEADER, BEARER} from "../model/common";
import type {Session} from "../model/common";

let beamsClient: Client | null = null;

// Abonne le navigateur aux notifications Push de l'utilisateur connecté
export function startNotifications(session: Session) {
    const instanceId = import.meta.env.VITE_PUSHER_INSTANCE_ID;
    if (!instanceId || beamsClient) return;

    beamsClient = new Client({instanceId});
    const beamsTokenProvider = new TokenProvider({
        url: "/api/beams",
        headers: {[AUTHENT_HEADER]: BEARER + session.token},
    });

    beamsClient.start()
        .then(() => beamsClient!.getUserId())
        .then((userId) => {
            // Le navigateur est encore abonné pour un autre utilisateur : on efface l'ancien abonnement
            if (userId && userId !== session.externalId) {
                return beamsClient!.clearAllState();
            }
        })
        .then(() => beamsClient!.addDeviceInterest("global"))
        .then(() => beamsClient!.setUserId(session.externalId, beamsTokenProvider))
        .then(() => beamsClient!.getDeviceId())
        .then((deviceId) => console.log("Push id : " + deviceId))
        .catch(console.error);
}

// À la déconnexion : on arrête les notifications de cet utilisateur
export function stopNotifications() {
    if (beamsClient) {
        beamsClient.stop().catch(console.error);
        beamsClient = null;
    }
}
