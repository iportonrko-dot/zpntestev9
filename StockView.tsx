/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  ShieldCheck, 
  Lock,
  Mail,
  UserCheck
} from "lucide-react";
import { Company, User, PlanType } from "../types.js";

interface MasterPanelViewProps {
  companies: Company[];
  allUsers: User[];
  onAddCompany: (name: string, plan: "bronze" | "prata" | "ouro", cnpj?: string) => Promise<any>;
  onToggleCompanyActive: (id: string) => Promise<any>;
  onAddUser: (userPayload: any) => Promise<any>;
}

export default function MasterPanelView({
  companies,
  allUsers,
  onAddCompany,
  onToggleCompanyActive,
  onAddUser
}: MasterPanelViewProps) {
  const [activeMasterTab, setActiveMasterTab] = useState<"companies" | "users">("companies");
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // New Company form states
  const [companyName, setCompanyName] = useState("");
  const [companyCnpj, setCompanyCnpj] = useState("");
  const [companyPlan, setCompanyPlan] = useState<"bronze" | "prata" | "ouro">("bronze");

  // New User form states
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "operator">("admin");
  const [userCompanyId, setUserCompanyId] = useState("");

  // Platform wide stats
  const masterStats = useMemo(() => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.active).length;
    const totalPlatformUsers = allUsers.length;

    // Simulate platform MRR
    let mrr = 0;
    companies.forEach(c => {
      if (c.active) {
        if (c.plan === PlanType.BRONZE || (c.plan as any) === "Bronze" || (c.plan as any) === "bronze") mrr += 99;
        else if (c.plan === PlanType.SILVER || (c.plan as any) === "Prata" || (c.plan as any) === "prata") mrr += 199;
        else if (c.plan === PlanType.GOLD || (c.plan as any) === "Ouro" || (c.plan as any) === "ouro") mrr += 299;
      }
    });

    return {
      totalCompanies,
      activeCompanies,
      totalPlatformUsers,
      mrr
    };
  }, [companies, allUsers]);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;
    try {
      await onAddCompany(companyName, companyPlan, companyCnpj || undefined);
      setIsCompanyModalOpen(false);
      setCompanyName("");
      setCompanyCnpj("");
      setCompanyPlan("bronze");
    } catch (err: any) {
      alert("Erro ao cadastrar empresa: " + err.message);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userUsername || !userPassword || !userCompanyId) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    try {
      await onAddUser({
        name: userName,
        username: userUsername,
        email: userEmail,
        password: userPassword,
        role: userRole,
        companyId: userCompanyId
      });
      setIsUserModalOpen(false);
      setUserName("");
      setUserUsername("");
      setUserEmail("");
      setUserPassword("");
      setUserRole("admin");
      setUserCompanyId("");
    } catch (err: any) {
      alert("Erro ao cadastrar usuário: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Platform Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-widest bg-blue-500/20 text-blue-300 font-extrabold px-2.5 py-1 rounded border border-blue-400/20">
            Painel de Controle Central - Master Admin
          </span>
          <h1 className="font-sans font-black text-2xl tracking-tight leading-none pt-2">
            ZPN Commerce SaaS Engine
          </h1>
          <p className="text-gray-400 text-xs">
            Visão consolidade do ecossistema, faturamento de assinaturas e provisionamento de novos estabelecimentos comerciais.
          </p>
        </div>
      </div>

      {/* Platform KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* MRR platform */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Faturamento Mensal (MRR)</span>
            <p className="font-sans font-black text-xl text-green-600 dark:text-green-400 mt-1">
              R$ {masterStats.mrr.toLocaleString("pt-BR")},00
            </p>
          </div>
          <CreditCard className="w-8 h-8 text-green-200 dark:text-green-950/40" />
        </div>

        {/* Total Companies */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Total de Empresas</span>
            <p className="font-sans font-black text-xl text-gray-900 dark:text-white mt-1">
              {masterStats.totalCompanies} cadastradas
            </p>
          </div>
          <Building2 className="w-8 h-8 text-blue-200 dark:text-blue-950/40" />
        </div>

        {/* Active Companies */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Empresas Ativas</span>
            <p className="font-sans font-black text-xl text-indigo-600 dark:text-indigo-400 mt-1">
              {masterStats.activeCompanies} operando
            </p>
          </div>
          <UserCheck className="w-8 h-8 text-indigo-200 dark:text-indigo-950/40" />
        </div>

        {/* Platform wide users */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Usuários na Plataforma</span>
            <p className="font-sans font-black text-xl text-gray-900 dark:text-white mt-1">
              {masterStats.totalPlatformUsers} operadores
            </p>
          </div>
          <Users className="w-8 h-8 text-gray-200 dark:text-gray-950/40" />
        </div>

      </div>

      {/* Sub Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex space-x-4">
        <button
          onClick={() => setActiveMasterTab("companies")}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition ${
            activeMasterTab === "companies" 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Empresas e Clientes SaaS
        </button>
        <button
          onClick={() => setActiveMasterTab("users")}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition ${
            activeMasterTab === "users" 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Usuários e Operadores
        </button>
      </div>

      {/* Master Action triggers row */}
      <div className="flex justify-end gap-3">
        {activeMasterTab === "companies" ? (
          <button
            onClick={() => setIsCompanyModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Provisionar Empresa</span>
          </button>
        ) : (
          <button
            onClick={() => setIsUserModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Usuário / Operador</span>
          </button>
        )}
      </div>

      {/* TABLES VIEW */}
      {activeMasterTab === "companies" ? (
        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">ID Empresa</th>
                  <th className="py-4 px-4">Nome Estabelecimento</th>
                  <th className="py-4 px-4">Documento / CNPJ</th>
                  <th className="py-4 px-4 text-center">Plano Ativo</th>
                  <th className="py-4 px-4 text-center">Data Expiração</th>
                  <th className="py-4 px-4 text-center">Situação Contrato</th>
                  <th className="py-4 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/40">
                    <td className="py-4 px-6 font-mono font-semibold text-gray-400">{c.id}</td>
                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">{c.name}</td>
                    <td className="py-4 px-4 font-mono text-gray-500">{c.document || "Nenhum CNPJ"}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-extrabold text-[10px] tracking-widest uppercase bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/40 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-500 font-medium">
                      {new Date(c.expirationDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.active 
                          ? "bg-green-50 dark:bg-green-950/25 text-green-700 dark:text-green-400" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        {c.active ? "Ativo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => onToggleCompanyActive(c.id)}
                        className={`inline-flex items-center space-x-1 py-1 px-2.5 rounded text-[10px] font-bold border transition ${
                          c.active 
                            ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                            : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                        }`}
                      >
                        {c.active ? "Bloquear Acesso" : "Liberar Acesso"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Nome Completo</th>
                  <th className="py-4 px-4">Usuário de Login</th>
                  <th className="py-4 px-4">Pertence à Empresa</th>
                  <th className="py-4 px-4 text-center">Nível de Acesso</th>
                  <th className="py-4 px-4">E-mail</th>
                  <th className="py-4 px-6 text-center">Data de Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                {allUsers.map((u) => {
                  const compName = companies.find(c => c.id === u.companyId)?.name || "Super Plataforma / Master";
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/40">
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{u.name}</td>
                      <td className="py-4 px-4 font-mono font-bold text-gray-500">{u.username}</td>
                      <td className="py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">{compName}</td>
                      <td className="py-4 px-4 text-center font-bold capitalize">{u.role}</td>
                      <td className="py-4 px-4 text-gray-500">{u.email}</td>
                      <td className="py-4 px-6 text-center text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision Company Modal */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
              <h3 className="font-sans font-bold text-gray-900 dark:text-white text-sm">Provisionar Novo Cliente SaaS</h3>
              <button onClick={() => setIsCompanyModalOpen(false)} className="text-gray-400 hover:text-gray-500">✕</button>
            </div>
            <form onSubmit={handleCompanySubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nome do Estabelecimento *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Adega do Roberto"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Documento / CNPJ (Opcional)</label>
                <input
                  type="text"
                  value={companyCnpj}
                  onChange={(e) => setCompanyCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Plano Contratado</label>
                <select
                  value={companyPlan}
                  onChange={(e) => setCompanyPlan(e.target.value as "bronze" | "prata" | "ouro")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm"
                >
                  <option value="bronze">Bronze (R$ 99/mês)</option>
                  <option value="prata">Prata (R$ 199/mês)</option>
                  <option value="ouro">Ouro (R$ 299/mês)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Criar e Provisionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
              <h3 className="font-sans font-bold text-gray-900 dark:text-white text-sm">Criar Usuário de Acesso</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-500">✕</button>
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: José da Silva"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Usuário de Login *</label>
                <input
                  type="text"
                  required
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  placeholder="Ex: jose_silva"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">E-mail</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="jose@gmail.com"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Senha Provisória *</label>
                <input
                  type="password"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Vincular à Empresa *</label>
                <select
                  required
                  value={userCompanyId}
                  onChange={(e) => setUserCompanyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm"
                >
                  <option value="">Selecione...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nível de Acesso *</label>
                <select
                  required
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as "admin" | "operator")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm"
                >
                  <option value="admin">Administrador (Total)</option>
                  <option value="operator">Operador (Apenas PDV/Entradas)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Criar Operador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
