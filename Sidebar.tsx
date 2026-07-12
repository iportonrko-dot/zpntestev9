/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { FinancialTransaction } from "../types.js";

interface FinancialViewProps {
  financials: FinancialTransaction[];
  elderMode: boolean;
  onAddTransaction: (trx: Omit<FinancialTransaction, "id" | "companyId" | "createdAt">) => Promise<any>;
  onMarkAsPaid: (id: string) => Promise<any>;
}

export default function FinancialView({
  financials,
  elderMode,
  onAddTransaction,
  onMarkAsPaid
}: FinancialViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"flow" | "payable" | "receivable">("flow");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"paid" | "pending">("pending");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setType("expense");
    setCategory("");
    setAmount("");
    setStatus("pending");
    setDueDate(new Date().toISOString().split("T")[0]);
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) {
      alert("Categoria e valor são obrigatórios.");
      return;
    }

    try {
      await onAddTransaction({
        type,
        category,
        amount: Number(amount),
        status,
        dueDate,
        description,
        paymentDate: status === "paid" ? new Date().toISOString().split("T")[0] : undefined
      });
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      alert("Erro ao salvar transação: " + err.message);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    let cashBalance = 0;
    let payablePending = 0;
    let receivablePending = 0;

    financials.forEach((f) => {
      if (f.status === "paid") {
        if (f.type === "income") cashBalance += f.amount;
        else cashBalance -= f.amount;
      } else {
        if (f.type === "expense") payablePending += f.amount;
        else receivablePending += f.amount;
      }
    });

    return {
      cashBalance,
      payablePending,
      receivablePending
    };
  }, [financials]);

  // Filtered lists
  const currentList = useMemo(() => {
    return [...financials]
      .reverse()
      .filter((f) => {
        if (activeSubTab === "payable" && f.type !== "expense") return false;
        if (activeSubTab === "receivable" && f.type !== "income") return false;
        
        if (statusFilter !== "all" && f.status !== statusFilter) return false;
        return true;
      });
  }, [financials, activeSubTab, statusFilter]);

  return (
    <div className="space-y-6">
      
      {/* Header and Add trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-extrabold text-gray-900 dark:text-white text-2xl tracking-tight">
            Controle Financeiro
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fluxo de caixa consolidado, pagamentos pendentes e recebimento de vendas
          </p>
        </div>
        <div>
          <button
            id="btn-add-financial-modal"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Saldo em Caixa */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Saldo Real em Caixa (Lançamentos Pagos)
          </p>
          <p className={`font-sans font-extrabold ${kpis.cashBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600"} ${elderMode ? "text-3xl" : "text-2xl"}`}>
            R$ {kpis.cashBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Contas a Pagar (Pendentes) */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Contas a Pagar (A Vencer)
            </p>
            <p className={`font-sans font-extrabold text-red-600 ${elderMode ? "text-3xl" : "text-2xl"}`}>
              R$ {kpis.payablePending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Clock className="w-8 h-8 text-red-300 dark:text-red-900/40" />
        </div>

        {/* Contas a Receber (Pendentes) */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Contas a Receber (Previsto)
            </p>
            <p className={`font-sans font-extrabold text-blue-600 dark:text-blue-400 ${elderMode ? "text-3xl" : "text-2xl"}`}>
              R$ {kpis.receivablePending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Clock className="w-8 h-8 text-blue-300 dark:text-blue-900/40" />
        </div>

      </div>

      {/* Tab Selectors */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveSubTab("flow"); setStatusFilter("all"); }}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition ${
            activeSubTab === "flow" 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Fluxo de Caixa Consolidado
        </button>
        <button
          onClick={() => { setActiveSubTab("payable"); setStatusFilter("all"); }}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition ${
            activeSubTab === "payable" 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Contas a Pagar (Despesas)
        </button>
        <button
          onClick={() => { setActiveSubTab("receivable"); setStatusFilter("all"); }}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition ${
            activeSubTab === "receivable" 
              ? "border-blue-600 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Contas a Receber (Receitas)
        </button>
      </div>

      {/* Sub-Filters based on Status (Paid, Pending) for standard listings */}
      {activeSubTab !== "flow" && (
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold uppercase text-gray-400">Filtrar status:</span>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              statusFilter === "all"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("paid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              statusFilter === "paid"
                ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/40"
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            Liquidado / Pago
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              statusFilter === "pending"
                ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40"
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            Aberto / Pendente
          </button>
        </div>
      )}

      {/* Financial Transactions List */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm overflow-hidden">
        {currentList.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            Nenhum lançamento financeiro encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Direção</th>
                  <th className="py-4 px-4">Categoria / Causa</th>
                  <th className="py-4 px-4">Descrição</th>
                  <th className="py-4 px-4 text-right">Valor</th>
                  <th className="py-4 px-4">Vencimento</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  {activeSubTab !== "flow" && statusFilter !== "paid" && <th className="py-4 px-6 text-center">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {currentList.map((f) => {
                  const isIncome = f.type === "income";
                  const isPaid = f.status === "paid";
                  const isOverdue = !isPaid && new Date(f.dueDate).getTime() < Date.now();

                  return (
                    <tr 
                      key={f.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900/20 text-gray-800 dark:text-gray-200 transition-colors ${
                        elderMode ? "text-base" : "text-xs"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                          isIncome 
                            ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/10" 
                            : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/10"
                        }`}>
                          {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                          <span>{isIncome ? "Entrada" : "Saída"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                        {f.category}
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">
                        {f.description || "-"}
                      </td>
                      <td className={`py-4 px-4 text-right font-black ${isIncome ? "text-green-600" : "text-red-600"}`}>
                        {isIncome ? "+" : "-"} R$ {f.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(f.dueDate).toLocaleDateString("pt-BR")}</span>
                          {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-500" title="Vencido!" />}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPaid 
                            ? "bg-green-50 dark:bg-green-950/25 text-green-700 dark:text-green-400" 
                            : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                        }`}>
                          {isPaid ? "Pago" : "Pendente"}
                        </span>
                      </td>
                      {activeSubTab !== "flow" && statusFilter !== "paid" && (
                        <td className="py-4 px-6 text-center">
                          {!isPaid ? (
                            <button
                              onClick={() => {
                                if (confirm("Confirmar baixa e liquidação deste lançamento financeiro?")) {
                                  onMarkAsPaid(f.id);
                                }
                              }}
                              className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-500 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition shadow-md shadow-green-500/10"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Dar Baixa</span>
                            </button>
                          ) : "-"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
              <h3 className="font-sans font-bold text-gray-900 dark:text-white text-base">
                Lançar Nova Transação
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-500">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Type selector (Receita vs Despesa) */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`py-1.5 rounded-md text-xs font-bold transition ${
                    type === "income" 
                      ? "bg-white dark:bg-gray-800 text-green-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Receita (+)
                </button>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`py-1.5 rounded-md text-xs font-bold transition ${
                    type === "expense" 
                      ? "bg-white dark:bg-gray-800 text-red-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Despesa (-)
                </button>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Categoria / Causa *</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Aluguel, Venda manual, Energia, Compra"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100 font-extrabold"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Data de Vencimento</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Situação</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "paid" | "pending")}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                >
                  <option value="pending">Pendente (Não Pago/Recebido)</option>
                  <option value="paid">Pago / Liquidado</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Descrição / Observações</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Informações adicionais..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10"
                >
                  Lançar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
