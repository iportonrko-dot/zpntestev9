/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Building,
  Sparkles,
  Glasses
} from "lucide-react";
import { Company, User, UserRole } from "../types.js";

interface NavbarProps {
  user: User;
  company: Company | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  elderMode: boolean;
  setElderMode: (val: boolean) => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  company,
  darkMode,
  setDarkMode,
  elderMode,
  setElderMode,
  onLogout
}: NavbarProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-sans font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                ZPN
              </span>
              <span className="font-sans font-medium text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800/40">
                Commerce
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 tracking-wide font-medium">
              ZPN SERVIÇOS
            </p>
          </div>
        </div>

        {/* Center / Company status for tenants */}
        {company && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
            <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {company.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
              company.subscriptionStatus === "active" 
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}>
              {company.plan}
            </span>
          </div>
        )}

        {/* Right tools */}
        <div className="flex items-center space-x-2">
          
          {/* Elder Mode / Modo Simplificado Toggle */}
          <button
            id="elder-mode-toggle"
            onClick={() => setElderMode(!elderMode)}
            title="Ativar Modo Simplificado (Letras Grandes)"
            className={`p-2.5 rounded-lg border transition-all duration-200 flex items-center space-x-1.5 ${
              elderMode 
                ? "bg-amber-100 border-amber-300 dark:bg-amber-900/40 dark:border-amber-800 text-amber-800 dark:text-amber-400 font-bold" 
                : "border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
            }`}
          >
            <Glasses className="w-4 h-4" />
            <span className="text-xs hidden lg:inline">Modo Facilitado</span>
          </button>

          {/* Theme Switcher */}
          <button
            id="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile details */}
          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-gray-800">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize font-medium">{user.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={onLogout}
            title="Sair do Sistema"
            className="p-2.5 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
          
        </div>
      </div>
    </header>
  );
}
