import { randomUUID } from "node:crypto";
import { query } from "../../shared/database/connection.js";
import type { User } from "./user.types.js";

export const createUser = async (
    email: string,
    name: string,
): Promise<User> => {
    const result = await query<User>(
        "insert into users (id,email,name) values ($1,$2,$3) returning id,email,name",
        [randomUUID(), email, name],
    );
    return result.rows[0];
};

export const getUser = async (id: string): Promise<User | null> => {
    const result = await query<User>(
        "select id,email,name from users where id=$1",
        [id],
    );
    return result.rows[0] ?? null;
};
