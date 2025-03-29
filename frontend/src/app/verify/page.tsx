"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Verify() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState("Verifying...");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setMessage("❌ Invalid verification link.");
            return;
        }

        async function verifyEmail() {
            try {
                const res = await axios.get(`http://localhost:8000/api/verify?token=${token}`);

                if (res.status === 200) {
                    setMessage("✅ Email verified! Redirecting...");
                    setTimeout(() => router.push("/login"), 3000); // Redirect after 3 seconds
                } else {
                    setMessage("❌ Verification failed.");
                }
            } catch (error) {
                setMessage("❌ An error occurred during verification.");
                console.log(error);
                
            }
        }

        verifyEmail();
    }, [searchParams, router]); // Added dependencies

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-xl font-bold">{message}</h1>
        </div>
    );
}
