/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Search, 
  Table,
  Check,
  TrendingUp,
  Package
} from "lucide-react";
import { Product, FinancialTransaction, StockMovement } from "../types.js";

interface ReportsViewProps {
  products: Product[];
  financials: FinancialTransaction[];
  movements: StockMovement[];
  elderMode: boolean;
}

export default function ReportsView({
  products,
  financials,
  movements,
  elderMode
}: ReportsViewProps) {
  const [reportType, setReportType] = useState<"sales" | "inventory" | "financial">("sales");
  const [timePeriod, setTimePeriod] = useState<"7days" | "30days" | "all">("30days");

  // Filter financial/sales data based on time period
  const reportData = useMemo(() => {
    const cutoffDate = new Date();
    if (timePeriod === "7days") {
      cutoffDate.setDate(cutoffDate.getDate() - 7);
    } else if (timePeriod === "30days") {
      cutoffDate.setDate(cutoffDate.getDate() - 30);
    } else {
      cutoffDate.setFullYear(2020); // All time
    }

    if (reportType === "sales") {
      // Return sales statistics (financials where type = income and status = paid)
      return financials.filter(f => f.type === "income" && f.status === "paid" && new Date(f.createdAt) >= cutoffDate);
    } else if (reportType === "inventory") {
      // Return inventory metrics (current products list, sorted or filtered by low stock)
      return products.map(p => {
        const productSales = financials
          .filter(f => f.type === "income" && f.status === "paid" && f.description.includes(p.name))
          .reduce((sum, f) => sum + f.amount, 0);

        return {
          id: p.id,
          name: p.name,
          barcode: p.barcode,
          stock: p.stock,
          minStock: p.minStock,
          price: p.price,
          purchasePrice: p.purchasePrice,
          totalSalesValue: productSales,
          status: p.stock <= p.minStock ? "Crítico" : "Normal"
        };
      });
    } else {
      // Return complete financial statements
      return financials.filter(f => new Date(f.createdAt) >= cutoffDate);
    }
  }, [financials, products, reportType, timePeriod]);

  // Export functions
  const downloadCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `relatorio-${reportType}-${timePeriod}.csv`;

    if (reportType === "sales") {
      headers = ["ID", "Categoria", "Valor (R$)", "Vencimento/Pagamento", "Descricao", "Data de Criacao"];
      rows = (reportData as FinancialTransaction[]).map(f => [
        f.id,
        f.category,
        f.amount.toFixed(2),
        f.dueDate,
        f.description,
        f.createdAt
      ]);
    } else if (reportType === "inventory") {
      headers = ["ID", "Nome do Produto", "Codigo de Barras", "Preco de Venda (R$)", "Preco de Custo (R$)", "Estoque Atual", "Estoque Minimo", "Situacao"];
      rows = (reportData as any[]).map(p => [
        p.id,
        p.name,
        p.barcode,
        p.price.toFixed(2),
        p.purchasePrice.toFixed(2),
        p.stock.toString(),
        p.minStock.toString(),
        p.status
      ]);
    } else {
      headers = ["ID", "Tipo", "Categoria", "Valor (R$)", "Situacao", "Vencimento", "Descricao"];
      rows = (reportData as FinancialTransaction[]).map(f => [
        f.id,
        f.type === "income" ? "Receita" : "Despesa",
        f.category,
        f.amount.toFixed(2),
        f.status === "paid" ? "Liquidado" : "Pendente",
        f.dueDate,
        f.description
      ]);
    }

    // Combine headers and rows
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:bg-white print:p-8">
      
      {/* Header (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-sans font-extrabold text-gray-900 dark:text-white text-2xl tracking-tight">
            Relatórios Inteligentes
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Filtre, visualize em tempo real ou exporte para planilhas e impressoras
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={downloadCSV}
            className="inline-flex items-center space-x-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Planilha Excel / CSV</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Selectors and Filters panel (hidden in print) */}
      <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        
        {/* Report Type */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Tipo de Relatório</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setReportType("sales")}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                reportType === "sales"
                  ? "bg-blue-50/60 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold"
                  : "border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-[11px]">Relatório de Vendas</span>
            </button>
            <button
              onClick={() => setReportType("inventory")}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                reportType === "inventory"
                  ? "bg-blue-50/60 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold"
                  : "border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400"
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="text-[11px]">Inventário de Estoque</span>
            </button>
            <button
              onClick={() => setReportType("financial")}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                reportType === "financial"
                  ? "bg-blue-50/60 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold"
                  : "border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[11px]">DRE e Fluxo Caixa</span>
            </button>
          </div>
        </div>

        {/* Time period */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Período de Tempo</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTimePeriod("7days")}
              className={`py-3 px-2 rounded-xl border text-center text-[11px] font-bold transition ${
                timePeriod === "7days"
                  ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400"
                  : "border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-500"
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setTimePeriod("30days")}
              className={`py-3 px-2 rounded-xl border text-center text-[11px] font-bold transition ${
                timePeriod === "30days"
                  ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400"
                  : "border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-500"
              }`}
            >
              Últimos 30 dias
            </button>
            <button
              onClick={() => setTimePeriod("all")}
              className={`py-3 px-2 rounded-xl border text-center text-[11px] font-bold transition ${
                timePeriod === "all"
                  ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400"
                  : "border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-500"
              }`}
            >
              Histórico Completo
            </button>
          </div>
        </div>

      </div>

      {/* Reports Display Sheet */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm p-6 space-y-6">
        
        {/* Printable Letterhead */}
        <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h3 className="font-sans font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight">
              Relatório Comercial ZPN
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
              Assunto: {reportType === "sales" ? "Vendas e Faturamento" : reportType === "inventory" ? "Inventário de Estoque" : "Controle de Fluxo de Caixa"}
            </p>
            <p className="text-[10px] text-gray-400">
              Emitido em: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 px-2 py-1 rounded text-blue-600 dark:text-blue-400">
              SaaS ZPN Commerce
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {reportType === "sales" && (
            <table className="w-full text-left border-collapse text-xs text-gray-800 dark:text-gray-200">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 font-bold text-gray-400 bg-gray-50 dark:bg-gray-900/20 uppercase tracking-wider">
                  <th className="py-3 px-4">Lançamento ID</th>
                  <th className="py-3 px-4">Frente / Categoria</th>
                  <th className="py-3 px-4">Detalhamento</th>
                  <th className="py-3 px-4 text-right">Valor Líquido</th>
                  <th className="py-3 px-4 text-center">Data Lançamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                {(reportData as FinancialTransaction[]).map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/40">
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-400">{f.id}</td>
                    <td className="py-3 px-4 font-bold">{f.category}</td>
                    <td className="py-3 px-4 text-gray-500">{f.description || "Venda via Assistente"}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">+ R$ {f.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center text-gray-400">{new Date(f.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "inventory" && (
            <table className="w-full text-left border-collapse text-xs text-gray-800 dark:text-gray-200">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 font-bold text-gray-400 bg-gray-50 dark:bg-gray-900/20 uppercase tracking-wider">
                  <th className="py-3 px-4">Item SKU / Nome</th>
                  <th className="py-3 px-4">EAN-13</th>
                  <th className="py-3 px-4 text-right">Preço de Venda</th>
                  <th className="py-3 px-4 text-right">Preço de Custo</th>
                  <th className="py-3 px-4 text-center">Qtd. Estoque</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                {(reportData as any[]).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/40">
                    <td className="py-3 px-4 font-bold">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{p.barcode || "-"}</td>
                    <td className="py-3 px-4 text-right font-semibold">R$ {p.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-gray-500">R$ {p.purchasePrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center font-bold">{p.stock} un</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === "Crítico" 
                          ? "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400" 
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "financial" && (
            <table className="w-full text-left border-collapse text-xs text-gray-800 dark:text-gray-200">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 font-bold text-gray-400 bg-gray-50 dark:bg-gray-900/20 uppercase tracking-wider">
                  <th className="py-3 px-4">Fluxo</th>
                  <th className="py-3 px-4">Categoria / Conta</th>
                  <th className="py-3 px-4 text-right">Valor Original</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4 text-center">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-medium">
                {(reportData as FinancialTransaction[]).map(f => {
                  const isInc = f.type === "income";
                  return (
                    <tr key={f.id} className="hover:bg-gray-50/40">
                      <td className="py-3 px-4">
                        <span className={`font-bold ${isInc ? "text-green-600" : "text-red-600"}`}>
                          {isInc ? "Receita (+)" : "Despesa (-)"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">{f.category}</td>
                      <td className={`py-3 px-4 text-right font-black ${isInc ? "text-green-600" : "text-red-600"}`}>
                        R$ {f.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{new Date(f.dueDate).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold ${f.status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                          {f.status === "paid" ? "Liquidado" : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}
