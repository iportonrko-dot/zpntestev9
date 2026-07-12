/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User as UserIcon, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  Tv, 
  Check, 
  Moon, 
  Sun,
  LayoutGrid
} from "lucide-react";
import { User, Company } from "../types.js";

interface SettingsViewProps {
  user: User;
  company?: Company;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  elderMode: boolean;
  setElderMode: (val: boolean) => void;
  onUpdatePassword: (old: string, next: string) => Promise<any>;
}

export default function SettingsView({
  user,
  company,
  darkMode,
  setDarkMode,
  elderMode,
  setElderMode,
  onUpdatePassword
}: SettingsViewProps) {
  const [activeSettingsSection, setActiveSettingsSection] = useState<"profile" | "security" | "preferences">("profile");

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // 2FA Fields
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAQr, setShow2FAQr] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [twoFaSuccess, setTwoFaSuccess] = useState("");

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    try {
      await onUpdatePassword(oldPassword, newPassword);
      setPasswordSuccess("Senha atualizada com sucesso!");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(""), 5000);
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar senha");
    }
  };

  const handle2FAVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode === "123456") {
      setIs2FAEnabled(true);
      setShow2FAQr(false);
      setTwoFaSuccess("Autenticação de Dois Fatores (2FA) ATIVADA com sucesso!");
      setTimeout(() => setTwoFaSuccess(""), 5000);
    } else {
      alert("Código inválido. Digite '123456' para o simulador.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-sans font-extrabold text-gray-900 dark:text-white text-2xl tracking-tight">
          Configurações do Sistema
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Gerencie seu perfil de usuário, preferências visuais, segurança da conta e assinatura do SaaS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Sidebar inside Settings */}
        <div className="space-y-1 bg-white dark:bg-gray-950 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm">
          <button
            onClick={() => setActiveSettingsSection("profile")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 ${
              activeSettingsSection === "profile"
                ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Perfil e Empresa</span>
          </button>
          
          <button
            onClick={() => setActiveSettingsSection("security")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 ${
              activeSettingsSection === "security"
                ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Segurança e 2FA</span>
          </button>

          <button
            onClick={() => setActiveSettingsSection("preferences")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 ${
              activeSettingsSection === "preferences"
                ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Acessibilidade / Tema</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm min-h-96">
          
          {/* PROFILE SECTION */}
          {activeSettingsSection === "profile" && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-sans font-bold text-gray-900 dark:text-white text-base">
                  Perfil do Usuário
                </h3>
                <p className="text-xs text-gray-500">Informações cadastrais básicas do seu usuário de acesso</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nome de Exibição</span>
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300">
                    {user.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nome de Usuário (Login)</span>
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                    {user.username}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nível de Permissão</span>
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">
                    {user.role}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">E-mail Cadastrado</span>
                  <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300">
                    {user.email}
                  </p>
                </div>
              </div>

              {company && (
                <>
                  <hr className="border-gray-100 dark:border-gray-900" />
                  <div>
                    <h3 className="font-sans font-bold text-gray-900 dark:text-white text-base">
                      Informações da Empresa / Plano
                    </h3>
                    <p className="text-xs text-gray-500">Dados contratuais do seu estabelecimento no ZPN Commerce</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nome Fantasia</span>
                      <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300">
                        {company.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Documento / CNPJ</span>
                      <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                        {company.document || "Isento / Não Informado"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Plano Ativo</span>
                      <p className="px-3.5 py-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-extrabold uppercase tracking-widest">
                        {company.plan}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Data de Expiração</span>
                      <p className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300">
                        {new Date(company.expirationDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

          {/* SECURITY SECTION */}
          {activeSettingsSection === "security" && (
            <div className="space-y-8">
              
              {/* Reset password form */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-sans font-bold text-gray-900 dark:text-white text-base flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <span>Alterar Senha de Acesso</span>
                  </h3>
                  <p className="text-xs text-gray-500">Altere sua senha regularmente para manter sua conta segura</p>
                </div>

                {passwordSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl text-green-700 dark:text-green-400 text-xs font-bold flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Senha Atual</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nova Senha</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition"
                    >
                      Alterar Senha
                    </button>
                  </div>
                </form>
              </div>

              <hr className="border-gray-150 dark:border-gray-900" />

              {/* 2FA Autenticador */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-sans font-bold text-gray-900 dark:text-white text-base flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <span>Autenticação de Dois Fatores (2FA)</span>
                  </h3>
                  <p className="text-xs text-gray-500">Adicione uma camada extra de proteção à sua conta usando o Google Authenticator ou similar</p>
                </div>

                {twoFaSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl text-green-700 dark:text-green-400 text-xs font-bold flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>{twoFaSuccess}</span>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Dispositivo de Segurança Móvel</p>
                    <p className="text-[11px] text-gray-500 max-w-md mt-1">Exige a digitação de um código de 6 dígitos gerado no seu celular ao realizar logins críticos de administradores.</p>
                  </div>
                  
                  {is2FAEnabled ? (
                    <span className="px-3.5 py-1.5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400 font-extrabold rounded-full text-xs">
                      Ativado com Sucesso
                    </span>
                  ) : (
                    <button
                      onClick={() => setShow2FAQr(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 transition"
                    >
                      Configurar 2FA
                    </button>
                  )}
                </div>

                {/* 2FA QR code visualizer simulation */}
                {show2FAQr && (
                  <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 flex flex-col items-center space-y-4 max-w-sm mx-auto text-center animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Escaneie o QR Code abaixo com seu aplicativo Autenticador</p>
                    
                    {/* Simulated vector QR Code box */}
                    <div className="w-40 h-40 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-center p-4">
                      <div className="grid grid-cols-4 gap-1">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={`w-6 h-6 rounded-sm ${i % 3 === 0 || i % 5 === 0 ? "bg-black dark:bg-white" : "bg-transparent"}`}></div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Chave Secreta Manual</p>
                      <p className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">ZPNX 2FA7 COMR 9901</p>
                    </div>

                    <form onSubmit={handle2FAVerify} className="w-full space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Código de Verificação de 6 Dígitos</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value)}
                          placeholder="Digite 123456 para simular"
                          className="w-full text-center px-4 py-2.5 font-mono tracking-widest text-lg font-black rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShow2FAQr(false)}
                          className="flex-1 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                        >
                          Validar e Ativar
                        </button>
                      </div>
                    </form>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* ACCESSIBILITY & PREFERENCES SECTION */}
          {activeSettingsSection === "preferences" && (
            <div className="space-y-6">
              
              <div>
                <h3 className="font-sans font-bold text-gray-900 dark:text-white text-base">
                  Acessibilidade e Preferências Visuais
                </h3>
                <p className="text-xs text-gray-500">Personalize o comportamento e a aparência da sua interface comercial</p>
              </div>

              {/* Mode Toggle row 1: Elder Mode */}
              <div className="bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200">Modo Simplificado (Modo Idoso)</p>
                  <p className="text-xs text-gray-500 max-w-md mt-0.5">Aumenta consideravelmente o tamanho de botões, textos de tabelas e simplifica o layout do menu lateral para facilitar o manuseio por pessoas de mais idade.</p>
                </div>
                
                <button
                  onClick={() => setElderMode(!elderMode)}
                  className={`w-14 h-8 rounded-full transition-colors relative focus:outline-none ${
                    elderMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-800"
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    elderMode ? "translate-x-6" : ""
                  }`}></span>
                </button>
              </div>

              {/* Mode Toggle row 2: Dark Theme */}
              <div className="bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200">Tema de Cores Escuro (Dark Mode)</p>
                  <p className="text-xs text-gray-500 max-w-md mt-0.5">Altera o esquema de cores para tons mais escuros e agradáveis para o uso noturno e em ambientes com pouca iluminação.</p>
                </div>
                
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-14 h-8 rounded-full transition-colors relative focus:outline-none ${
                    darkMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-800"
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    darkMode ? "translate-x-6" : ""
                  }`}></span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
