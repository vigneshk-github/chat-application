"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import axios, { AxiosError } from "axios";

export function Login() {
    const router = useRouter();

    const sendData = async (prevState: string[], formData: FormData) => {
        try {
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            const res = await axios.post("http://localhost:8000/api/login", { email, password },{withCredentials:true});
            console.log(res.data);
            router.push(`/room/${email}`);
            return res.data.message;
        } catch (err) {
            const error = err as AxiosError<{ error: string }>;
            return error.response?.data?.error || error.message;
        }
    };

    const [data, formAction, isPending] = useActionState(sendData, []);

    return (
        <div className="flex flex-col justify-center items-center h-[80vh] w-full gap-3">
            <div className="flex mb-10">
                <p className="font-bold text-3xl">Login page</p>
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
            <div>
                <p>{data}</p>
            </div>
        </div>
    );
}
