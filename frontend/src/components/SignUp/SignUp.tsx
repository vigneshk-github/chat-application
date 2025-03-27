"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useActionState, useState } from "react";
import axios, { AxiosError } from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SignUp() {
    const [color, setColor] = useState<'red' | 'green'>('red');
    const router = useRouter();
    const { data: session } = useSession();

    // Effect to redirect after successful Google sign-in
    useEffect(() => {
        if (session?.user?.email) {
            const userEmail = session.user.email;
            router.push(`/room/${userEmail}`);
        }
    }, [session, router]);

    async function sendFormData(prevState: string, formData: FormData) {
        try {
            // Use type assertion and provide fallback
            const email = (formData.get("email") as string) ?? '';
            const password = (formData.get("password") as string) ?? '';

            // Validate inputs
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Register user
            const res = await axios.post("http://localhost:8000/api/register", {
                email,
                password
            });

            // Automatically sign in after registration
            const signInResult = await signIn("credentials", {
                redirect: false,
                email,
                password
            });

            // Check for sign-in errors
            if (signInResult?.error) {
                throw new Error(signInResult.error);
            }

            setColor("green");
            router.push(`/room/${email}`);
            return res.data.message || 'Registration successful';
        } catch (err: unknown) {
            const error = err as AxiosError<{ error: string }>;
            setColor("red");
            console.error(error);
            return error.response?.data?.error || error.message || 'Registration failed';
        }
    }

    async function handleGoogleSignIn() {
        try {
            await signIn("google");
            // Note: Redirection is now handled by the useEffect hook
        } catch (error) {
            console.error("Google Sign-In Error:", error);
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
                <Input
                    className="w-full"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    required
                />

                <Label htmlFor="password">Password</Label>
                <Input
                    className="w-full"
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    required
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Submitting..." : "Submit"}
                </Button>
            </form>

            {/* Google Sign-In Button */}
            <Button onClick={handleGoogleSignIn} variant="outline">
                Sign In with Google
            </Button>

            <p style={{ color }}>{response}</p>
        </div>
    );
}