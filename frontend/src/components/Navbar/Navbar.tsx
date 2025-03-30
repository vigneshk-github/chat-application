"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { googleSignOut } from "@/auth/authentic";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, LogOut, User } from "lucide-react";

type User = {
    email?: string;
    name?: string;
};

export default function Navbar({ user }: { user: User | null }) {
    function getInitials(name?: string, email?: string): string {
        if (name && name.length > 0) {
            return name.substring(0, 2).toUpperCase();
        } else if (email && email.length > 0) {
            return email.substring(0, 2).toUpperCase();
        }
        return "U";
    }

    return (
        <nav className="flex justify-between items-center px-4 py-3 md:px-8 bg-gray-900 text-white">
            <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <Link href="/" className="text-lg font-bold hover:text-gray-200 transition-colors">
                    Chat App
                </Link>
            </div>

            <div className="flex gap-3 items-center">
                {user && user.email ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10 border-2 border-gray-700 hover:border-gray-500 transition-colors">
                                    <AvatarFallback className="bg-blue-600 text-white">
                                        {getInitials(user.name, user.email)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="truncate">{user.email}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <form action={googleSignOut}>
                                <DropdownMenuItem asChild className="text-red-500 focus:text-red-500 cursor-pointer">
                                    <button type="submit" className="w-full flex items-center gap-2">
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </DropdownMenuItem>
                            </form>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" className="text-sm hover:bg-gray-800 hover:text-white">
                            <Link href="/login" className="flex items-center gap-1">
                                Login
                            </Link>
                        </Button>
                        <Button className="text-sm bg-blue-600 hover:bg-blue-700">
                            <Link href="/signup">SignUp</Link>
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
}