"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

const schema = z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormField = z.infer<typeof schema>;

export function Login() {
    const router = useRouter();
    const [res, setRes] = useState("");
    const { data: session, status } = useSession();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormField>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            router.push(`/room/${session.user.email}`);
        }
    }, [status, session, router]);

    const onSubmit: SubmitHandler<FormField> = async (data) => {
        try {
            const signInResult = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (signInResult?.error) {
                setRes("Verify the Mail or Password is Incorrect");
                return;
            }
        } catch (error) {
            console.error(error);
        }
    };

    const googleSignUp = async () => {
        try {
            const signInResult = await signIn("google", { redirect: false });

            if (signInResult?.error) {
                console.error("Google Sign-in failed:", signInResult.error);
                return;
            }
        } catch (error) {
            console.error("Google Sign-in failed", error);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-[80vh] w-full gap-3">
            <div className="flex mb-10">
                <p className="font-bold text-3xl">Login page</p>
            </div>
            <form className="flex flex-col gap-2 w-full max-w-md px-10" onSubmit={handleSubmit(onSubmit)}>
                <Label htmlFor="email">Email</Label>
                <Input {...register("email")} className="w-full" type="email" id="email" name="email" placeholder="Email" required />
                {errors.email && <div className="text-red-500">{errors.email.message}</div>}

                <Label htmlFor="password">Password</Label>
                <Input {...register("password")} className="w-full" type="password" id="password" name="password" placeholder="Password" required />
                {errors.password && <div className="text-red-500">{errors.password.message}</div>}

                <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Loading..." : "Submit"}
                </Button>

                <p className="text-red-500">{res}</p>
            </form>

            <Button onClick={googleSignUp}>Sign in with Google</Button>
        </div>
    );
}
