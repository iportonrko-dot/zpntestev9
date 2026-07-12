/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar.js";
import Sidebar from "./components/Sidebar.js";
import DashboardView from "./components/DashboardView.js";
import ProductsView from "./components/ProductsView.js";
import StockView from "./components/StockView.js";
import FinancialView from "./components/FinancialView.js";
import SuppliersClientsView from "./components/SuppliersClientsView.js";
import ReportsView from "./components/ReportsView.js";
import AuditView from "./components/AuditView.js";
import UsersView from "./components/UsersView.js";
import SettingsView from "./components/SettingsView.js";
import MasterPanelView from "./components/MasterPanelView.js";
import AssistantFloatingChat from "./components/AssistantFloatingChat.js";

import { 
  User, 
  Company, 
  Product, 
  Category, 
  Supplier, 
  Client, 
  FinancialTransaction, 
  StockMovement, 
  AuditLog,
  UserRole
} from "./types.js";
import { Sparkles, MessageSquare, ShieldAlert, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";

export default function App() {
  // Session states
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("zpn_token"));
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  // App settings
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem("zpn_dark") === "true");
  const [elderMode, setElderMode] = useState<boolean>(() => localStorage.getItem("zpn_elder") === "true");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Floating assistant states
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialCommand, setAssistantInitialCommand] = useState<string | undefined>(undefined);

  // Core domain records
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [financials, setFinancials] = useState<FinancialTransaction[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Master SaaS lists
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Login form states
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Forced password reset states
  const [resetOldPassword, setResetOldPassword] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Dark Mode side effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("zpn_dark", darkMode.toString());
  }, [darkMode]);

  // Elder Mode side effects
  useEffect(() => {
    localStorage.setItem("zpn_elder", elderMode.toString());
  }, [elderMode]);

  // Validate session on load
  useEffect(() => {
    if (token) {
      validateSession(token);
    }
  }, [token]);

  // Fetch all domain lists when session is active
  useEffect(() => {
    if (token && user) {
      fetchAllData();
    }
  }, [token, user]);

  const validateSession = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCompany(data.company);
        
        // Default views based on roles
        if (data.user.role === UserRole.MASTER) {
          setActiveTab("master");
        } else {
          setActiveTab("dashboard");
        }
      } else {
        // Clear stale session
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    }
  };

  const fetchAllData = async () => {
    if (!token || !user) return;
    const headers = { "Authorization": `Bearer ${token}` };

    try {
      if (user.role === UserRole.MASTER) {
        // Master SaaS views
        const [compRes, usersRes, auditRes] = await Promise.all([
          fetch("/api/master/companies", { headers }),
          fetch("/api/master/users", { headers }),
          fetch("/api/audit-logs", { headers }) // Shared logs
        ]);

        if (compRes.ok) setCompanies(await compRes.json());
        if (usersRes.ok) setAllUsers(await usersRes.json());
        if (auditRes.ok) setAuditLogs(await auditRes.json());
      } else {
        // Tenant Standard View
        const [prodRes, catRes, supRes, cliRes, finRes, stockRes, auditRes] = await Promise.all([
          fetch("/api/products", { headers }),
          fetch("/api/categories", { headers }),
          fetch("/api/suppliers", { headers }),
          fetch("/api/clients", { headers }),
          fetch("/api/financials", { headers }),
          fetch("/api/stock-movements", { headers }),
          fetch("/api/audit-logs", { headers })
        ]);

        if (prodRes.ok) setProducts(await prodRes.json());
        if (catRes.ok) setCategories(await catRes.json());
        if (supRes.ok) setSuppliers(await supRes.json());
        if (cliRes.ok) setClients(await cliRes.json());
        if (finRes.ok) setFinancials(await finRes.json());
        if (stockRes.ok) setStockMovements(await stockRes.json());
        if (auditRes.ok) setAuditLogs(await auditRes.json());
      }
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) return;

    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao efetuar login");
      }

      // Check for forced password reset
      if (data.user.forcePasswordReset) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("zpn_token", data.token);
        // Switch view state to password reset layout instead of home dashboard
        setResetSuccess(false);
        setResetError("");
        return;
      }

      setToken(data.token);
      setUser(data.user);
      setCompany(data.company);
      localStorage.setItem("zpn_token", data.token);

      if (data.user.role === UserRole.MASTER) {
        setActiveTab("master");
      } else {
        setActiveTab("dashboard");
      }
    } catch (err: any) {
      setLoginError(err.message || "Credenciais inválidas ou sem acesso.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForcedPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!resetOldPassword || !resetNewPassword || !resetConfirmPassword) {
      setResetError("Por favor preencha todos os campos.");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("A nova senha e confirmação não batem.");
      return;
    }

    if (resetNewPassword.length < 6) {
      setResetError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: resetOldPassword,
          newPassword: resetNewPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao trocar a senha");
      }

      setResetSuccess(true);
      // Let the user know, then reload profile to update status
      setTimeout(() => {
        if (user) {
          setUser({ ...user, forcePasswordReset: false });
          if (user.role === UserRole.MASTER) {
            setActiveTab("master");
          } else {
            setActiveTab("dashboard");
          }
        }
      }, 3000);
    } catch (err: any) {
      setResetError(err.message || "Erro ao atualizar senha provisória.");
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (e) {}
    }
    setToken(null);
    setUser(null);
    setCompany(null);
    localStorage.removeItem("zpn_token");
    setActiveTab("dashboard");
  };

  // --- BUSINESS OPERATION FUNCTIONS ---

  const handleAddProduct = async (payload: any) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao cadastrar");
    }
    fetchAllData();
    return await res.json();
  };

  const handleUpdateProduct = async (id: string, payload: any) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao atualizar");
    }
    fetchAllData();
    return await res.json();
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao excluir");
    }
    fetchAllData();
    return await res.json();
  };

  const handleAddCategory = async (name: string) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao criar categoria");
    }
    fetchAllData();
    return await res.json();
  };

  const handleAddTransaction = async (payload: any) => {
    const res = await fetch("/api/financials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao registrar");
    }
    fetchAllData();
    return await res.json();
  };

  const handleMarkAsPaid = async (id: string) => {
    const res = await fetch(`/api/financials/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: "paid" })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao dar baixa");
    }
    fetchAllData();
    return await res.json();
  };

  const handleAddSupplier = async (name: string, contact: string, phone: string, email: string) => {
    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, contact, phone, email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao cadastrar fornecedor");
    }
    fetchAllData();
    return await res.json();
  };

  const handleAddClient = async (name: string, phone: string, email: string, document: string) => {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, phone, email, document })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao cadastrar cliente");
    }
    fetchAllData();
    return await res.json();
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao alterar senha");
    }
    return await res.json();
  };

  // --- MASTER ONLY FUNCTIONS ---

  const handleAddCompanyMaster = async (name: string, plan: "bronze" | "prata" | "ouro", cnpj?: string) => {
    const res = await fetch("/api/master/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, document: cnpj || "isento", plan })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao provisionar");
    }
    fetchAllData();
    return await res.json();
  };

  const handleToggleCompanyActiveMaster = async (id: string) => {
    const res = await fetch(`/api/master/companies/${id}/toggle-status`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao alterar status");
    }
    fetchAllData();
    return await res.json();
  };

  const handleAddUserMaster = async (payload: any) => {
    const res = await fetch("/api/master/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao cadastrar usuário");
    }
    fetchAllData();
    return await res.json();
  };

  // Trigger floating assistant from outside shortcuts
  const handleOpenAssistantWithCommand = (command?: string) => {
    setAssistantInitialCommand(command);
    setIsAssistantOpen(true);
  };

  // --- LAYOUT RENDERING GATES ---

  // Gate 1: No active session token
  if (!token || !user) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center px-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-8 rounded-2xl shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-md shadow-blue-500/10 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <h2 className="font-sans font-black text-2xl tracking-tight text-gray-950 dark:text-white leading-none">
              ZPN Commerce
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Assistente Inteligente para pequenos comerciantes
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/35 text-red-700 dark:text-red-400 text-xs font-bold flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Usuário de Login</label>
              <input
                id="login-username"
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ex: adega_roberto"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Senha de Acesso</label>
              <input
                id="login-password"
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-white"
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition shadow-md shadow-blue-500/10 flex items-center justify-center space-x-2"
            >
              {loginLoading ? "Verificando..." : "Entrar no Sistema"}
              {!loginLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-400">
              Não tem uma conta? Entre em contato com o <strong>Suporte ZPN Serviços</strong> para contratar e habilitar seu estabelecimento comercial.
            </p>
          </div>

        </div>
      </main>
    );
  }

  // Gate 2: Forced Password Reset (First login required action)
  if (user && user.forcePasswordReset) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center px-4 transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 p-8 rounded-2xl shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center text-white mb-2 shadow-md">
              <KeyRound className="w-5 h-5 text-yellow-300" />
            </div>
            <h2 className="font-sans font-black text-xl tracking-tight text-gray-950 dark:text-white leading-none">
              Troca de Senha Obrigatória
            </h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Este é o seu primeiro acesso! Por motivos de segurança, você precisa redefinir sua senha provisória de administrador.
            </p>
          </div>

          {resetSuccess ? (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold flex flex-col items-center text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              <p className="font-bold">Senha Redefinida com Sucesso!</p>
              <p className="text-[10px] font-medium text-gray-500">Iniciando painel ZPN Commerce em instantes...</p>
            </div>
          ) : (
            <>
              {resetError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleForcedPasswordReset} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Senha Provisória Atual</label>
                  <input
                    type="password"
                    required
                    value={resetOldPassword}
                    onChange={(e) => setResetOldPassword(e.target.value)}
                    placeholder="Sua senha provisória atual"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition shadow-md shadow-blue-500/10"
                >
                  Salvar Nova Senha
                </button>
              </form>
            </>
          )}

        </div>
      </main>
    );
  }

  // --- VIEW ROUTER COMPONENT MATCHER ---
  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            products={products}
            financials={financials}
            elderMode={elderMode}
            onOpenAssistant={handleOpenAssistantWithCommand}
            onNavigate={(t) => setActiveTab(t)}
          />
        );
      case "products":
        return (
          <ProductsView
            products={products}
            categories={categories}
            suppliers={suppliers}
            elderMode={elderMode}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
          />
        );
      case "stock":
        return (
          <StockView
            movements={stockMovements}
            elderMode={elderMode}
            onOpenAssistant={handleOpenAssistantWithCommand}
          />
        );
      case "financial":
        return (
          <FinancialView
            financials={financials}
            elderMode={elderMode}
            onAddTransaction={handleAddTransaction}
            onMarkAsPaid={handleMarkAsPaid}
          />
        );
      case "contacts":
        return (
          <SuppliersClientsView
            suppliers={suppliers}
            clients={clients}
            elderMode={elderMode}
            onAddSupplier={handleAddSupplier}
            onAddClient={handleAddClient}
          />
        );
      case "reports":
        return (
          <ReportsView
            products={products}
            financials={financials}
            movements={stockMovements}
            elderMode={elderMode}
          />
        );
      case "audit":
        return (
          <AuditView
            logs={auditLogs}
            elderMode={elderMode}
          />
        );
      case "users":
        return (
          <UsersView
            users={allUsers.filter(u => u.companyId === user.companyId)}
            elderMode={elderMode}
          />
        );
      case "settings":
        return (
          <SettingsView
            user={user}
            company={company || undefined}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            elderMode={elderMode}
            setElderMode={setElderMode}
            onUpdatePassword={handleUpdatePassword}
          />
        );
      case "master":
        return (
          <MasterPanelView
            companies={companies}
            allUsers={allUsers}
            onAddCompany={handleAddCompanyMaster}
            onToggleCompanyActive={handleToggleCompanyActiveMaster}
            onAddUser={handleAddUserMaster}
          />
        );
      default:
        return (
          <div className="p-12 text-center text-gray-500">
            Página não encontrada ou sob construção.
          </div>
        );
    }
  };

  // Main UI Frame rendering
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        company={company}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        elderMode={elderMode}
        setElderMode={setElderMode}
        onLogout={handleLogout}
      />

      {/* Center Layout split */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 gap-6">
        
        {/* Left sidebar navigation */}
        <Sidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          elderMode={elderMode}
        />

        {/* Central Workspace view */}
        <main className="flex-1 overflow-hidden min-h-[500px]">
          {renderActiveView()}
        </main>

      </div>

      {/* Quick Launch Floating Chat Bubble Trigger */}
      <button
        id="btn-trigger-assistant-chat"
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 active:scale-95 z-40"
        title="Falar com o Assistente Comercial"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full"></span>
      </button>

      {/* Floating ChatGPT/WhatsApp Assistant window panel */}
      <AssistantFloatingChat
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setAssistantInitialCommand(undefined);
        }}
        elderMode={elderMode}
        initialCommand={assistantInitialCommand}
        onRefreshData={fetchAllData}
        token={token || ""}
      />

    </div>
  );
}
