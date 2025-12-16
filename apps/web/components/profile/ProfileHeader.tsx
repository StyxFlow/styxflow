"use client";

import { useEffect, useRef } from "react";
import { IUser } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  FiMail,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiBriefcase,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import gsap from "gsap";

interface ProfileHeaderProps {
  user: IUser;
  address?: string;
  organizationName?: string;
  organizationRole?: string;
}

const ProfileHeader = ({
  user,
  address,
  organizationName,
  organizationRole,
}: ProfileHeaderProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        avatarRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      );

      gsap.fromTo(
        infoRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: "power2.out" }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      ref={headerRef}
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div ref={avatarRef} className="relative group cursor-pointer">
          <Avatar className="w-28 h-28 border-4 border-main/20 transition-all duration-300 group-hover:border-main/40">
            <AvatarImage
              src={user.image || ""}
              alt={user.name}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="text-3xl bg-main/10 text-main font-bold">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1">
            {user.emailVerified ? (
              <div className="bg-green-500 rounded-full p-1">
                <FiCheckCircle className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="bg-amber-500 rounded-full p-1">
                <FiXCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        <div ref={infoRef} className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-3">
            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
            <Badge
              variant="secondary"
              className="bg-main/10 text-main hover:bg-main/20 transition-colors"
            >
              {user.role}
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <FiMail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>

          {/* Additional info for Candidate (address) */}
          {address && (
            <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-gray-500 text-sm">
              <FiMapPin className="w-4 h-4" />
              <span>{address}</span>
            </div>
          )}

          {/* Additional info for Recruiter (organization) */}
          {(organizationName || organizationRole) && (
            <div className="flex flex-col md:flex-row items-center gap-4 mt-3 text-gray-500 text-sm">
              {organizationName && (
                <div className="flex items-center gap-2">
                  <HiOutlineOfficeBuilding className="w-4 h-4" />
                  <span>{organizationName}</span>
                </div>
              )}
              {organizationRole && (
                <div className="flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4" />
                  <span>{organizationRole}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
