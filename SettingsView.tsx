/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Package, 
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  ShoppingBag
} from "lucide-react";
import { Product, FinancialTransaction } from "../types.js";

interface DashboardViewProps {
  products: Product[];
  financials: FinancialTransaction[];
  elderMode: boolean;
  onOpenAssistant: (initialCommand?: string) => void;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  products,
  financials,
  elderMode,
  onOpenAssistant,
  onNavigate
}: DashboardViewProps) {
  // Compute financial indicators
  const stats = useMemo(() => {
    let totalIncomes = 0;
    let totalExpenses = 0;
    let paidIncomes = 0;
    let paidExpenses = 0;

    financials.forEach((f) => {
      if (f.type === "income") {
        totalIncomes += f.amount;
        if (f.status === "paid") paidIncomes += f.amount;
      } else {
        totalExpenses += f.amount;
        if (f.status === "paid") paidExpenses += f.amount;
      }
    });

    const netProfit = paidIncomes - paidExpenses;
    const margin = paidIncomes > 0 ? (netProfit / paidIncomes) * 100 : 0;

    return {
      totalIncomes,
      totalExpenses,
      paidIncomes,
      paidExpenses,
      netProfit,
      margin
    };
  }, [financials]);

  // Find low-stock products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStock).slice(0, 5);
  }, [products]);

  // Find upcoming bills (next 5 pending bills)
  const upcomingBills = useMemo(() => {
    return financials
      .filter((f) => f.status === "pending")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [financials]);

  // Calculate most sold products (simulate based on negative movements / price in products)
  const topProducts = useMemo(() => {
    // Just sort by stock level as a simple simulation, or mock top sellers
    return [...products]
      .sort((a, b) => (b.price - a.price))
      .slice(0, 3);
  }, [products]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Header & Clean Assist Box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-gray-950 dark:text-white tracking-tight">
            Olá! Vamos organizar o comércio hoje?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mt-1">
            Seu assistente inteligente está pronto para gerenciar o estoque, lançar vendas e boletos.
          </p>
        </div>
        <div className="mt-3 md:mt-0">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] font-extrabold border border-blue-150 dark:border-blue-900/60">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span>Assistente Inteligente ZPN</span>
          </div>
        </div>
      </div>

      {/* Clean Minimalist Instruction Card */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200/80 dark:border-gray-900 shadow-sm rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1 flex-1">
          <span className="text-[9px] uppercase font-black tracking-widest text-blue-600 dark:text-blue-400">Entradas Simplificadas</span>
          <h2 className="font-sans font-bold text-gray-900 dark:text-white text-sm">Controle por voz e leitura de Nota Fiscal</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            Clique no assistente flutuante ou envie uma foto de Nota Fiscal para que nossa inteligência faça a leitura e a entrada de novos produtos no estoque de forma instantânea.
          </p>
        </div>
        
        {/* Quick Audio/Text Suggestions */}
        <div className="flex flex-wrap gap-1.5 lg:justify-end max-w-md">
          <button
            onClick={() => onOpenAssistant("Quanto tenho de Brahma no estoque?")}
            className="text-[10px] bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-300 font-bold py-2 px-3 border border-gray-200 dark:border-gray-800 rounded-lg transition-colors"
          >
            "Quanto tenho de Brahma?"
          </button>
          <button
            onClick={() => onOpenAssistant("Vendi duas Brahma e um Guaraná Antarctica")}
            className="text-[10px] bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-300 font-bold py-2 px-3 border border-gray-200 dark:border-gray-800 rounded-lg transition-colors"
          >
            "Vendi duas Brahma..."
          </button>
          <button
            onClick={() => onOpenAssistant("Quais boletos vencem essa semana?")}
            className="text-[10px] bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-300 font-bold py-2 px-3 border border-gray-200 dark:border-gray-800 rounded-lg transition-colors"
          >
            "O que vence esta semana?"
          </button>
        </div>
      </div>

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Receitas */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Receitas (Faturamento)
            </span>
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className={`font-sans font-extrabold text-gray-900 dark:text-white ${elderMode ? 'text-3xl' : 'text-2xl'}`}>
              R$ {stats.paidIncomes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center space-x-1 font-medium">
              <span>R$ {stats.totalIncomes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} total com pendentes</span>
            </p>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Despesas (Custos)
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className={`font-sans font-extrabold text-gray-900 dark:text-white ${elderMode ? 'text-3xl' : 'text-2xl'}`}>
              R$ {stats.paidExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center space-x-1 font-medium">
              <span>R$ {stats.totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} total com pendentes</span>
            </p>
          </div>
        </div>

        {/* Lucro */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Lucro Real Caixa
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className={`font-sans font-extrabold ${stats.netProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600"} ${elderMode ? 'text-3xl' : 'text-2xl'}`}>
              R$ {stats.netProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center space-x-1 font-medium">
              <span>Lucro bruto líquido liquidado</span>
            </p>
          </div>
        </div>

        {/* Margem */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Margem Média Caixa
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className={`font-sans font-extrabold text-purple-600 dark:text-purple-400 ${elderMode ? 'text-3xl' : 'text-2xl'}`}>
              {stats.margin.toFixed(1)}%
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center space-x-1 font-medium">
              <span>Margem de lucro sobre receitas</span>
            </p>
          </div>
        </div>

      </div>

      {/* Center Layout: Graph & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG custom graph column */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-gray-900 dark:text-white text-base">
              Acompanhamento Financeiro Semanal
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Total consolidado de receitas, despesas e saldo líquido
            </p>
          </div>

          {/* Simple and elegant CSS custom visual graph */}
          <div className="h-52 w-full flex items-end space-x-4 md:space-x-8 px-4 border-b border-gray-100 dark:border-gray-800 pb-2">
            
            {/* Week 1 */}
            <div className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full flex justify-center space-x-1 h-36 items-end">
                <div className="w-3 bg-green-500 rounded-t-sm h-[30%]" title="Receitas: R$ 3.400"></div>
                <div className="w-3 bg-red-500 rounded-t-sm h-[20%]" title="Despesas: R$ 2.100"></div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Semana 1</span>
            </div>

            {/* Week 2 */}
            <div className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full flex justify-center space-x-1 h-36 items-end">
                <div className="w-3 bg-green-500 rounded-t-sm h-[50%]" title="Receitas: R$ 5.200"></div>
                <div className="w-3 bg-red-500 rounded-t-sm h-[35%]" title="Despesas: R$ 3.800"></div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Semana 2</span>
            </div>

            {/* Week 3 */}
            <div className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full flex justify-center space-x-1 h-36 items-end">
                <div className="w-3 bg-green-500 rounded-t-sm h-[80%]" title="Receitas: R$ 8.900"></div>
                <div className="w-3 bg-red-500 rounded-t-sm h-[40%]" title="Despesas: R$ 4.200"></div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Semana 3</span>
            </div>

            {/* Week 4 (Current) */}
            <div className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full flex justify-center space-x-1 h-36 items-end">
                {/* Dynamically size the current week based on stats! */}
                <div 
                  className="w-3 bg-green-500 rounded-t-sm" 
                  style={{ height: `${Math.min(100, Math.max(10, (stats.paidIncomes / 10000) * 100))}%` }} 
                  title={`Receitas: R$ ${stats.paidIncomes}`}
                ></div>
                <div 
                  className="w-3 bg-red-500 rounded-t-sm" 
                  style={{ height: `${Math.min(100, Math.max(10, (stats.paidExpenses / 10000) * 100))}%` }} 
                  title={`Despesas: R$ ${stats.paidExpenses}`}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-extrabold">Semana Atual</span>
            </div>

          </div>

          <div className="flex justify-center items-center space-x-6 pt-4 text-xs">
            <div className="flex items-center space-x-1.5 font-semibold text-gray-600 dark:text-gray-400">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Receitas Recebidas</span>
            </div>
            <div className="flex items-center space-x-1.5 font-semibold text-gray-600 dark:text-gray-400">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Despesas Pagas</span>
            </div>
          </div>
        </div>

        {/* Alerts Column */}
        <div className="space-y-4">
          
          {/* Low stock indicators */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-gray-900 dark:text-white text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Estoque Crítico / Baixo</span>
              </h3>
              <button 
                onClick={() => onNavigate("products")}
                className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 flex items-center space-x-1"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                Parabéns! Nenhum produto com estoque crítico.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-900/60 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{p.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Mínimo: {p.minStock} unidades</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-extrabold border border-amber-100 dark:border-amber-900/30">
                      {p.stock} un
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming bills / financials pending */}
          <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-gray-900 dark:text-white text-sm flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Contas a Pagar / Receber</span>
              </h3>
              <button 
                onClick={() => onNavigate("financial")}
                className="text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 flex items-center space-x-1"
              >
                <span>Financeiro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingBills.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                Nenhum lançamento financeiro pendente.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBills.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-900/60 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{b.category} - {b.description || "Lançamento"}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Vence em: {new Date(b.dueDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className={`text-xs font-extrabold ${b.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                      {b.type === "expense" ? "-" : "+"} R$ {b.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Top Sellers (Products card list) */}
      <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm space-y-4">
        <div>
          <h3 className="font-sans font-bold text-gray-900 dark:text-white text-base">
            Produtos Mais Relevantes em Estoque
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Principais itens avaliados por maior valor agregado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topProducts.map((p) => (
            <div key={p.id} className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">SKU Produto</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{p.name}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-extrabold">Preço: R$ {p.price.toFixed(2)}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Estoque Atual</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">{p.stock} un</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
