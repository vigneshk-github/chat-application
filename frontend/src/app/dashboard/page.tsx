"use client";

import { useSession } from "next-auth/react";

export default function Dashboard() {
    const { data: session } = useSession();

    return (
        <div>
            <h1>This is a Dashboard</h1>
            <p>{session?.user?.email || "No user logged in"}</p>
        </div>
    );
}
