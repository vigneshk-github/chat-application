"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { useActionState, useState } from "react";
import axios, { AxiosError } from "axios";
import { googleSignIn } from "@/auth/authentic";
import { useRouter } from "next/navigation";


export function SignUp() {
    const [color, setColor] = useState("red");
    const router = useRouter();
    async function sendFormData(prevState: string, formData: FormData) {
        try {
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            const res = await axios.post("http://localhost:8000/api/register", { email, password });
            setColor("green");
            router.push(`/room/${email}`)
            return res.data.message;
        } catch (err: unknown) {
            const error = err as AxiosError<{ error: string }>;
            setColor("red");
            console.log(error.message);
            return error.response?.data?.error || error.message;
        }
    }

    const [response, formAction, isPending] = useActionState(sendFormData, "");

    return (
        <div className="flex flex-col justify-center items-center h-[80vh] w-full gap-3">
            <div className="flex mb-10">
                <p className="font-bold text-3xl">Signup page</p>
            </div>
            <form action={formAction} className="flex flex-col gap-2 w-full max-w-md">
                <Label htmlFor="email">Email</Label>
                <Input className="w-full" type="email" id="email" name="email" placeholder="Email" required />
                <Label htmlFor="password">Password</Label>
                <Input className="w-full" type="password" id="password" name="password" placeholder="Password" required />
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Submitting..." : "Submit"}
                </Button>
            </form>

            {/* Google Sign-In Form */}
            <form action={googleSignIn}>
                <Button type="submit">Sign In with Google</Button>
            </form>

            <p style={{ color }}>{response}</p>
        </div>
    );
}
