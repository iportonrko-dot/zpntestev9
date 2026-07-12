/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { ShieldAlert, Search, Calendar, Globe, User as UserIcon } from "lucide-react";
import { AuditLog } from "../types.js";

interface AuditViewProps {
  logs: AuditLog[];
  elderMode: boolean;
}

export default function AuditView({ logs, elderMode }: AuditViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = useMemo(() => {
    return [...logs]
      .reverse() // Newest first
      .filter((log) => {
        return (
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  }, [logs, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-sans font-extrabold text-gray-900 dark:text-white text-2xl tracking-tight">
          Logs de Auditoria e Conformidade (LGPD)
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Registro imutável e detalhado de todas as operações críticas e acessos de usuários no sistema
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-900 shadow-sm flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ação, operador ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Logs list */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm overflow-hidden">
        
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            Nenhum registro de auditoria encontrado.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-colors ${
                  elderMode ? "text-base" : "text-xs"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  
                  {/* Title and Operator row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white px-2 py-0.5 bg-gray-100 dark:bg-gray-900 rounded font-mono text-[10px] uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-gray-400 font-bold">•</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                      <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{log.userName}</span>
                    </span>
                  </div>

                  {/* Details statement */}
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {log.details}
                  </p>

                </div>

                {/* Metadata Column */}
                <div className="flex flex-wrap items-center md:flex-col md:items-end gap-2 text-gray-400 dark:text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-300" />
                    <span>{new Date(log.createdAt).toLocaleString("pt-BR")}</span>
                  </span>
                  <span className="hidden md:inline text-gray-300 dark:text-gray-800">•</span>
                  <span className="flex items-center space-x-1 font-mono text-[10px]">
                    <Globe className="w-3.5 h-3.5 text-gray-300" />
                    <span>IP: {log.ip}</span>
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
