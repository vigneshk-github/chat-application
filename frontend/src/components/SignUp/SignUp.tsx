"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import { useState } from "react";

const schema = z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormField = z.infer<typeof schema>;

export function SignUp() {
    const [res,setRes] = useState("");
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormField>({ resolver: zodResolver(schema) });

    const onSubmit: SubmitHandler<FormField> = async (data) => {
        try {
            const res = await axios.post(`${process.env.BACKEND_URL}/api/register`, {
                email: data.email,
                password: data.password,
            });

            setRes(res.data.message);

        } catch (error) {
            const axiosError = error as AxiosError<{ error: string }>;
            setError("root", { message: axiosError.response?.data?.error || "Something went wrong. Please try again." });
        }
    };

    const googleSignUp = async () => {
        try {
            await signIn("google", { redirect: true, callbackUrl: "/dashboard" });
        } catch (error) {
            console.error("Google Sign-in failed", error);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-[80vh] w-full gap-3">
            <div className="flex mb-10">
                <p className="font-bold text-3xl">Signup page</p>
            </div>

            <form className="flex flex-col gap-2 w-full max-w-md" onSubmit={handleSubmit(onSubmit)}>
                <Label htmlFor="email">Email</Label>
                <Input {...register("email")} className="w-full" type="email" id="email" placeholder="Email" required />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}

                <Label htmlFor="password">Password</Label>
                <Input {...register("password")} className="w-full" type="password" id="password" placeholder="Password" required />
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}

                <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Loading..." : "Submit"}
                </Button>
                {errors.root && <p className="text-red-500">{errors.root.message}</p>}
            </form>

            <Button onClick={googleSignUp}>Sign in with Google</Button>

            <p className="text-green-500">{res}</p>
        </div>
    );
}
