"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import type { Session } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending, refetch } = authClient.useSession();
  const session = data as Session | null;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for profile navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isProfileShortcut = isMac
        ? e.metaKey && e.shiftKey && e.key === "p"
        : e.ctrlKey && e.shiftKey && e.key === "p";

      if (isProfileShortcut && session) {
        e.preventDefault();
        router.push("/profile");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session, router]);

  const handleLogout = async () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          redirect("/login");
        },
      },
    });
    refetch();
  };

  const navLinks = [
    { href: "/", label: "Home", route: "" },
    { href: "/about", label: "About", route: "about" },
    {
      href: "/create-job",
      label: "Create Job",
      userRole: "RECRUITER",
      route: "create-job",
    },
    {
      href: "/uploaded-jobs",
      label: "Uploaded Jobs",
      userRole: "RECRUITER",
      route: "uploaded-jobs",
    },
    {
      href: "/attempt-interview",
      label: "Attempt Interview",
      userRole: "CANDIDATE",
      route: "attempt-interview",
    },
  ];

  const isHome = pathname === "/";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
        isHome
          ? isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-100/50 py-3 shadow-sm"
            : "bg-transparent py-6 border-transparent"
          : "bg-background/80 backdrop-blur-md border-b border-border py-4"
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl  font-bold font-logo text-main hover:opacity-80 transition-opacity tracking-tight"
          >
            StyxFlow
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  `text-sm font-bold font-body transition-all hover:text-main relative group ${link?.userRole && link.userRole !== session?.user.role ? "hidden" : ""}`,
                  pathname === link.href ? "text-main" : "text-gray-600"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-main transition-all duration-300 group-hover:w-full",
                    pathname === link.href ? "w-full" : ""
                  )}
                />
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          {session ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLogout}
                variant="default"
                className="font-bold  hover:text-main"
              >
                Logout
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="border-none cursor-pointer focus:outline-none outline-none">
                  <Avatar>
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User"}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <Link href={"/profile"}>
                      <DropdownMenuItem>
                        Profile
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem>
                      Billing
                      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Keyboard shortcuts
                      <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Invite users
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem>Email</DropdownMenuItem>
                          <DropdownMenuItem>Message</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>More...</DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem>
                      New Team
                      <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>GitHub</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuItem disabled>API</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Log out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : isPending ? (
            <div className="w-20 h-9 bg-gray-100 animate-pulse rounded-full"></div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="font-bold text-gray-700 hover:text-main hover:bg-transparent"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="shadow-lg shadow-main/20 hover:shadow-main/40 transition-all hover:scale-105 active:scale-95">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
