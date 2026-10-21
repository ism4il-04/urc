import type {EmptyCallback, ErrorCallback} from "../model/common";
import {CustomError} from "../model/CustomError";

export interface NewUser {
    username: string;
    email: string;
    password: string;
}

export function registerUser(user: NewUser, onResult: EmptyCallback, onError: ErrorCallback) {
    fetch("/api/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        })
        .then(async (response) => {
            if (response.ok) {
                onResult();
            } else {
                const error = await response.json() as CustomError;
                onError(error);
            }
        }, onError);
}
