import { useEffect, useRef, useState } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";

interface ProfileMenuProps {
  className?: string;
}

export default function ProfileMenu({ className = "" }: ProfileMenuProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [lastLogin, setLastLogin] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUsername(storedUser);
      fetch(`/api/profile?username=${encodeURIComponent(storedUser)}`).then(
        async (res) => {
          if (!res.ok) return;
          const data = await res.json();
          if (data.lastLogin) setLastLogin(data.lastLogin);
        }
      );
    }
    const handleClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      className={`relative ${className} border border-gray-400 rounded-lg`}
      ref={profileRef}
    >
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition focus:outline-none"
        onClick={() => setProfileOpen((v) => !v)}
        aria-label="Profile menu"
      >
        <User className="w-6 h-6 text-blue-600" />
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      {profileOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg z-10 p-4 flex flex-col gap-2 animate-fade-in">
          <div className="mb-2">
            <div className="font-semibold text-lg text-gray-900">
              @{username || "Unknown User"}
            </div>
            <div className="text-xs text-gray-500">
              Last Login:{" "}
              {lastLogin ? new Date(lastLogin).toLocaleDateString() : "N/A"}
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-red-600 hover:bg-gray-50 transition text-sm font-semibold"
            onClick={() => {
              localStorage.removeItem("apifyApiKey");
              localStorage.removeItem("currentUser");
              window.location.href = "/auth";
            }}
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
