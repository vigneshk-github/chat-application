import Link from "next/link";
import { Button } from "../ui/button";

export default function LandingPage() {
    return (
        <div className="flex flex-col gap-10 justify-center items-center w-full h-[80vh]">
            <p className="flex font-bold text-6xl">Welcome to the Chatting Application</p>
            <Button><Link href="/login">Start Now</Link></Button>
        </div>
    )
}