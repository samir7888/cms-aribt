import { useState } from "react";
import {
  Users,
  Trophy,
  FileText,
  Handshake,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import Sponsors from "./dashboard/Sponsors";
import About from "./dashboard/About";
import Partners from "./dashboard/Partners";
import TeamMembers from "./dashboard/TeamMembers";

interface DashboardProps {
  onLogout: () => void;
}

type ActiveSection = "sponsors" | "about" | "partners" | "team";

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("sponsors");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: "sponsors" as ActiveSection, label: "Sponsors", icon: Trophy },
    { id: "about" as ActiveSection, label: "About Hackathon", icon: FileText },
    {
      id: "partners" as ActiveSection,
      label: "Supporting Partners",
      icon: Handshake,
    },
    { id: "team" as ActiveSection, label: "Team Members", icon: Users },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "sponsors":
        return <Sponsors />;
      case "about":
        return <About />;
      case "partners":
        return <Partners />;
      case "team":
        return <TeamMembers />;

      default:
        return <Sponsors />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <h1 className="text-xl font-bold text-white">ARIBT CMS</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-800 capitalize">
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h2>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
