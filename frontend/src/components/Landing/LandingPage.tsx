import Link from "next/link";
import { Button } from "../ui/button";

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-[90vh] px-6">
            <div
                className="text-center"
            >
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                    Welcome to the Chatting Application
                </h1>
                <p className="mt-4 text-lg  max-w-xl mx-auto">
                    Connect with people instantly and experience seamless real-time chat like never before.
                </p>
            </div>
            <div
                className="mt-8"
            >

                <Button asChild className="text-lg p-8">
                    <Link href="/login">Start Now</Link>
                </Button>
            </div>
        </div>
    )
}