import {AUTHENT_HEADER, BEARER} from "../model/common";
import type {User} from "../model/common";

// Erreur levée quand le token de session n'est plus valide
export class UnauthorizedError extends Error {}

export async function fetchUsers(token: string): Promise<User[]> {
    const response = await fetch("/api/users", {
        headers: {[AUTHENT_HEADER]: BEARER + token},
    });
    if (response.status === 401) {
        throw new UnauthorizedError();
    }
    return await response.json() as User[];
}
