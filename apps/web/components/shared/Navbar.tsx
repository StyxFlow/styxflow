"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import type { Session } from "@/lib/auth-client";

const Navbar = () => {
  const pathname = usePathname();
  const { data, isPending, refetch } = authClient.useSession();
  const session = data as Session | null;

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            StyxFlow
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  `text-sm font-medium transition-colors hover:text-primary relative pb-1 ${link?.userRole && link.userRole !== session?.user.role ? "hidden" : ""}`,
                  pathname
                    .split("/")
                    .filter((_, idx) => idx !== 0)
                    .includes(link.route)
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          {session ? (
            <Button onClick={handleLogout}>Logout</Button>
          ) : isPending ? (
            <p>Loading...</p>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
