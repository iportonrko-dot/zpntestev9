/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tags, 
  Truck, 
  AlertTriangle,
  FolderPlus,
  Barcode
} from "lucide-react";
import { Product, Category, Supplier } from "../types.js";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  elderMode: boolean;
  onAddProduct: (prod: Omit<Product, "id" | "companyId" | "createdAt">) => Promise<any>;
  onUpdateProduct: (id: string, prod: Partial<Product>) => Promise<any>;
  onDeleteProduct: (id: string) => Promise<any>;
  onAddCategory: (name: string) => Promise<any>;
}

export default function ProductsView({
  products,
  categories,
  suppliers,
  elderMode,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory
}: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  // Category modal or quick add state
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Clean form
  const resetForm = () => {
    setName("");
    setBarcode("");
    setPrice("");
    setPurchasePrice("");
    setStock("");
    setMinStock("");
    setCategoryId("");
    setSupplierId("");
    setExpirationDate("");
    setEditingProduct(null);
  };

  // Open form for editing
  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBarcode(p.barcode);
    setPrice(p.price.toString());
    setPurchasePrice(p.purchasePrice.toString());
    setStock(p.stock.toString());
    setMinStock(p.minStock.toString());
    setCategoryId(p.categoryId || "");
    setSupplierId(p.supplierId || "");
    setExpirationDate(p.expirationDate || "");
    setIsFormOpen(true);
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert("Nome e preço de venda são obrigatórios.");
      return;
    }

    const payload = {
      name,
      barcode,
      price: Number(price),
      purchasePrice: Number(purchasePrice) || 0,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0,
      categoryId,
      supplierId,
      expirationDate: expirationDate || undefined
    };

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, payload);
      } else {
        await onAddProduct(payload);
      }
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      alert("Erro ao salvar produto: " + err.message);
    }
  };

  // Quick Category Addition
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await onAddCategory(newCategoryName);
      setNewCategoryName("");
      setIsCategoryFormOpen(false);
    } catch (err: any) {
      alert("Erro ao salvar categoria: " + err.message);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.barcode.includes(searchTerm);
      const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      
      {/* Header and Add trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-extrabold text-gray-900 dark:text-white text-2xl tracking-tight">
            Gerenciamento de Produtos
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fichas cadastrais, códigos de barras e limites de segurança de estoque
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="btn-add-category-modal"
            onClick={() => setIsCategoryFormOpen(true)}
            className="inline-flex items-center space-x-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Criar Categoria</span>
          </button>
          
          <button
            id="btn-add-product-modal"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Quick filters and search */}
      <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-900 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="search-product-input"
            type="text"
            placeholder="Buscar por nome ou código de barra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto items-center justify-start md:justify-end">
          <span className="text-[10px] font-bold uppercase text-gray-400 mr-1.5">Filtro:</span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedCategory === "all"
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40"
                : "border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-900/60 text-gray-500 hover:bg-gray-100"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedCategory === cat.id
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40"
                  : "border-gray-100 dark:border-gray-900 bg-gray-50 dark:bg-gray-900/60 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

      </div>

      {/* Products list table / cards */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-900 shadow-sm overflow-hidden">
        
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <p className="font-semibold">Nenhum produto cadastrado nesta categoria.</p>
            <p className="text-xs mt-1">Clique em "Novo Produto" para cadastrar o primeiro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Produto</th>
                  <th className="py-4 px-4">Cod. Barras</th>
                  <th className="py-4 px-4">Categoria</th>
                  <th className="py-4 px-4 text-right">Preço de Venda</th>
                  <th className="py-4 px-4 text-right">Preço de Custo</th>
                  <th className="py-4 px-4 text-center">Estoque</th>
                  <th className="py-4 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {filteredProducts.map((p) => {
                  const categoryName = categories.find(c => c.id === p.categoryId)?.name || "Sem Categoria";
                  const isLowStock = p.stock <= p.minStock;

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900/20 text-gray-800 dark:text-gray-200 transition-colors ${
                        elderMode ? "text-base" : "text-xs"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                          {p.expirationDate && (
                            <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                              Validade: {new Date(p.expirationDate).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-mono">
                        {p.barcode ? (
                          <span className="flex items-center space-x-1">
                            <Barcode className="w-3.5 h-3.5 text-gray-400" />
                            <span>{p.barcode}</span>
                          </span>
                        ) : "-"}
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">{categoryName}</td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">
                        R$ {p.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-500 dark:text-gray-400">
                        R$ {p.purchasePrice.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <span className={`px-2.5 py-1 rounded-full font-black ${
                            isLowStock 
                              ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 animate-pulse" 
                              : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                          }`}>
                            {p.stock} un
                          </span>
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-amber-500" title="Estoque abaixo do mínimo!" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-2 rounded-lg border border-gray-100 dark:border-gray-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/10 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza que quer excluir "${p.name}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-2 rounded-lg border border-red-100 dark:border-red-900/10 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
              <h3 className="font-sans font-bold text-gray-900 dark:text-white text-base">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Cerveja Skol Lata 350ml"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Barcode */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Código de Barras</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="EAN-13 / Código interno"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Prices Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Preço Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Preço Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Estoque Inicial</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    disabled={!!editingProduct} // For safety, only correct in editing
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="10"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Categorias & Fornecedores selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Categoria</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Fornecedor</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                  >
                    <option value="">Selecione...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Expiration date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Data de Validade (Opcional)</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
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
                  Salvar Produto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Category Creation Dialog */}
      {isCategoryFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
              <h3 className="font-sans font-bold text-gray-900 dark:text-white text-sm">Criar Categoria</h3>
              <button onClick={() => setIsCategoryFormOpen(false)} className="text-gray-400 hover:text-gray-500">✕</button>
            </div>
            <form onSubmit={handleAddCategorySubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Bebidas e Sucos"
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryFormOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/10"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
