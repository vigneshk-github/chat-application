import Link from "next/link";
import { Button } from "../ui/button";

export default function Navbar() {
    return (
        <div className="flex justify-between items-center m-10 gap-5 ">
            <div>
                <p className="text-xl font-bold">
                    <Link href="/">Home</Link>
                </p>
            </div>
            <div className="flex gap-3">
                <Button className="">
                    <Link href="/login">Login</Link>
                </Button>
                <Button>
                    <Link href="/signup">SignUp</Link>
                </Button>
            </div>

        </div>
    )
}