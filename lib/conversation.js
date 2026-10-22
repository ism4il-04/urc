// Même clé pour A -> B et B -> A : on trie les 2 identifiants
export function conversationKey(id1, id2) {
    const [a, b] = [Number(id1), Number(id2)].sort((x, y) => x - y);
    return "messages:" + a + ":" + b;
}

// Messages d'un salon
export function roomKey(roomId) {
    return "messages:room:" + Number(roomId);
}
