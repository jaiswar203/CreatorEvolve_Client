"use client"

import Link from "next/link"
import React from "react"
import {
    Home,
    Menu,
    LucideIcon,
    Microscope,
    Film,
    AudioLines,
    Image as ImageIcon,
    Settings
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { APP_ROUTES } from "@/constants/routes"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RiLogoutCircleLine } from "react-icons/ri";
import { logOutUser } from "@/redux/slices/user"

interface NavItem {
    href: string;
    icon: LucideIcon;
    label: string;
    badge?: number;
    active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { href: APP_ROUTES.DASHBOARD, icon: Home, label: "Dashboard" },
    { href: APP_ROUTES.REEL_GENERATOR, icon: Film, label: "Short/Reel Generator" },
    { href: APP_ROUTES.VOICE, icon: AudioLines, label: "Voice" },
    { href: APP_ROUTES.RESEARCH_WIZARD, icon: Microscope, label: "Research Wizard" },
    { href: APP_ROUTES.THUMBNAIL, icon: ImageIcon, label: "Thumbnail" },
    { href: APP_ROUTES.SETTING, icon: Settings, label: "Setting" },
];

interface NavigationLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    badge?: number;
    active?: boolean;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({ href, icon: Icon, label, badge, active }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${active ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"}`}
    >
        <Icon className="h-4 w-4" />
        {label}
        {
            badge && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    {badge}
                </Badge>
            )
        }
    </Link>
);

interface SideBarProps {
    children: React.ReactNode;
}

const SideBar: React.FC<SideBarProps> = ({ children }) => {
    const pathname = usePathname()
    const { user } = useAppSelector((state) => state.user)
    const router = useRouter()
    const dispatch = useAppDispatch()

    if (pathname.startsWith("/auth")) return children

    if (!user?._id || !user?.access_token) {
        router.push(APP_ROUTES.SIGNIN)
        return
    }


    const logOut = () => {
        dispatch(logOutUser())
        router.push(APP_ROUTES.SIGNIN)
    }


    return (
        <div className="flex min-h-screen">
            <div className="hidden md:block md:w-[220px] lg:w-[280px] border-r bg-muted/40 h-screen sticky top-0">
                <div className="flex h-full flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 justify-between">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Image src={"/assets/icon.webp"} width={45} height={45} alt="CE" className="rounded" />
                            <span>CreatorEvolve</span>
                        </Link>
                        <RiLogoutCircleLine color="red" onClick={logOut} size={25} className="cursor-pointer" />
                    </div>
                    <div className="flex-1 overflow-auto">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            {NAV_ITEMS.map((navItem, index) => (
                                <NavigationLink key={index} {...navItem} active={pathname.includes(navItem.href)} />
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t ">
                        <div className="flex">
                            <Avatar className="w-16 h-16 mr-4">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="flex items-start flex-col ">
                                <h2 className="font-semibold">{user.name}</h2>
                                <p className="text-xs mb-1 text-gray-500">{user.email}</p>
                                <p className="text-xs font-semibold text-primary">Credits: {user.credits} </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div className="flex flex-1 flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col w-7/12">
                            <nav className="grid gap-2 text-lg font-medium">
                                {NAV_ITEMS.map((item, index) => (
                                    <NavigationLink key={index} {...item} active={pathname === item.href} />
                                ))}
                            </nav>
                            <div className="mt-auto ">
                                <div className="flex border-t">
                                    <Avatar className="w-16 h-16 mr-4">
                                        <AvatarImage src={user?.img} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-start flex-col ">
                                        <h2 className="font-medium">{user.name}</h2>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        <p className="text-xs font-semibold text-primary">Credits: {user.credits} </p>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    {/* <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                />
                            </div>
                        </form>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu> */}
                </header>
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SideBar;
