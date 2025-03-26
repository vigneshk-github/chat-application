"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { googleSignOut } from "@/auth/authentic";


type User = {
    email?: string;
    name?: string;
};

export default function Navbar({ user }: { user: User | null }) {
    return (
        <div className="flex justify-between items-center m-10 gap-5">
            <div>
                <p className="text-xl font-bold">
                    <Link href="/">Home</Link>
                </p>
            </div>
            <div className="flex gap-3">
                {user && user.email ? (
                    <>
                        <p>{user.email}</p>
                        <form action={googleSignOut}>
                            <Button type="submit">Sign Out</Button>
                        </form>
                    </>
                ) : (
                    <>
                        <Button>
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button>
                            <Link href="/signup">SignUp</Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
