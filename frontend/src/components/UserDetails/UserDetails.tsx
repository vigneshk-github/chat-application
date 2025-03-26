"use server";

import { auth } from "@/auth";

type User = {
    email: string;
    name: string;
};

export async function UserDetails(): Promise<User | null> {
    const session = await auth();
    if (!session?.user) return null;

    return {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
    };
}
