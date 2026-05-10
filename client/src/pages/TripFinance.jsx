import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  DollarSign, ArrowLeft, Plus, Edit2, Trash2, 
  TrendingUp, TrendingDown, AlertTriangle, Loader2, CreditCard,
  X
} from 'lucide-react';
import TravelShell from '../components/TravelShell.jsx';
import AppNavbar from '../components/AppNavbar.jsx';
import { rememberTripId } from '../lib/lastTrip.js';

const CATEGORY_COLORS = {
  Hotel: '#6366f1', // Indigo
  Flight: '#0ea5e9', // Sky blue
  Train: '#8b5cf6', // Violet
  Food: '#f59e0b', // Amber
  Activity: '#10b981', // Emerald
  Other: '#64748b' // Slate
};

export default function TripFinance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Other',
    description: '',
    arrival_date: '',
    departure_date: '',
    amount: ''
  });

  useLayoutEffect(() => {
    rememberTripId(id);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tripRes, expRes, sumRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/trips/${id}/expenses`),
        api.get(`/trips/${id}/expenses/summary`)
      ]);
      setTrip(tripRes.data);
      setExpenses(expRes.data.expenses);
      setSummary(sumRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load financial data. Please try again.');
        toast.error('Failed to load financial data');
      }
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      category: 'Other',
      description: '',
      arrival_date: '',
      departure_date: '',
      amount: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category || 'Other',
      description: exp.description || '',
      arrival_date: exp.arrival_date || '',
      departure_date: exp.departure_date || '',
      amount: exp.amount || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (expId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/expenses/${expId}`);
      toast.success('Expense deleted');
      fetchData(); // refresh data
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, formData);
      } else {
        await api.post(`/trips/${id}/expenses`, formData);
      }
      setModalOpen(false);
      toast.success(editingExpense ? 'Expense updated' : 'Expense added');
      fetchData();
    } catch (err) {
      toast.error('Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TravelShell>
        <AppNavbar />
        <div className="flex flex-1 items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-300" />
        </div>
      </TravelShell>
    );
  }

  if (error) {
    return (
      <TravelShell>
        <AppNavbar />
        <div className="flex flex-1 items-center justify-center px-4 py-32">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center text-rose-100 backdrop-blur-xl">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-2 text-2xl font-bold">{error}</h2>
            <button
              type="button"
              onClick={fetchData}
              className="mt-4 rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-rose-400"
            >
              Try Again
            </button>
          </div>
        </div>
      </TravelShell>
    );
  }

  if (!trip || !summary) return null;

  // Prepare chart data
  const pieData = Object.keys(summary.categoryTotals).map(key => ({
    name: key,
    value: summary.categoryTotals[key]
  }));

  const barData = summary.dailyChartData;

  const budget = Number(summary.budget) || 0;
  const spent = Number(summary.totalSpent) || 0;
  const remaining = budget > 0 ? budget - spent : 0;
  const overBudget = budget > 0 && spent > budget;
  
  const percentageSpent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <TravelShell>
      <AppNavbar />
      <div className="min-h-0 flex-1 pb-20 font-sans text-stone-100">
      {/* 1. Trip Finance Hero Section */}
      <div className="relative overflow-hidden pt-8 pb-32 text-white">
        <img
          src={
            trip.cover_photo ||
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=2000&q=75'
          }
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/80 via-night-950/70 to-night-950" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <Link to="/trips" className="mb-6 inline-flex items-center text-sm font-semibold text-stone-400 transition-colors hover:text-white">
            <ArrowLeft className="mr-1 h-4 w-4" /> My Trips
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400">
                Finance Dashboard
              </h1>
              <p className="text-xl text-stone-300 font-medium">{trip.name}</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500"
            >
              <Plus className="h-5 w-5" /> Add Expense
            </motion.button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-6 -mt-20">
        
        {/* 2. Budget Overview Cards */}
        {overBudget && (
          <div className="mb-6 rounded-2xl bg-red-500 bg-opacity-10 border border-red-500/20 p-4 flex items-center gap-4 text-red-500 dark:text-red-400 backdrop-blur-md">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div>
              <h4 className="font-bold">Over Budget Alert</h4>
              <p className="text-sm">You have exceeded your total budget by ${Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}.</p>
            </div>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50 dark:border-stone-800 dark:bg-stone-800">
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Total Budget</p>
            <p className="text-3xl font-extrabold">${budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentageSpent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${overBudget ? 'bg-red-500' : 'bg-blue-500'}`}
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50 dark:border-stone-800 dark:bg-stone-800">
            <div className="mb-1 flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <span>Total Spent</span>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
              ${spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`rounded-3xl border ${overBudget ? 'border-red-500/50 bg-red-50 dark:bg-red-900/10' : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-800'} p-6 shadow-xl shadow-stone-200/50 dark:shadow-none`}>
            <div className={`mb-1 flex items-center justify-between text-sm font-semibold uppercase tracking-wider ${overBudget ? 'text-red-600 dark:text-red-400' : 'text-stone-500 dark:text-stone-400'}`}>
              <span>Remaining</span>
              <TrendingDown className="h-4 w-4" />
            </div>
            <p className={`text-3xl font-extrabold ${overBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              ${Math.max(remaining, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50 dark:border-stone-800 dark:bg-stone-800">
            <div className="mb-1 flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <span>Expenses</span>
              <CreditCard className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {expenses.length}
            </p>
          </motion.div>
        </motion.div>

        {/* 5. & 6. Charts Section */}
        {expenses.length > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md dark:border-stone-800 dark:bg-stone-800">
              <h3 className="mb-6 text-lg font-bold text-stone-800 dark:text-stone-100">Expenses by Category</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS['Other']} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md dark:border-stone-800 dark:bg-stone-800">
              <h3 className="mb-6 text-lg font-bold text-stone-800 dark:text-stone-100">Daily Spending</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Spent']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 3. Expense Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-3xl border border-stone-200 bg-white shadow-xl shadow-stone-200/40 dark:border-stone-800 dark:bg-stone-800 overflow-hidden">
          <div className="p-6 border-b border-stone-200 dark:border-stone-700">
            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Recent Transactions</h3>
          </div>
          
          {expenses.length === 0 ? (
            <div className="p-12 text-center text-stone-500 dark:text-stone-400">
              <DollarSign className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-2 text-lg font-medium">No expenses recorded yet.</p>
              <p className="text-sm">Click "Add Expense" to start tracking your spending.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 dark:bg-stone-800/50 uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/80">
                      <td className="px-6 py-4">
                        <span 
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[exp.category] || CATEGORY_COLORS['Other'] }}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-stone-900 dark:text-stone-200">
                        {exp.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-stone-500 dark:text-stone-400">
                        {exp.arrival_date ? new Date(exp.arrival_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-stone-900 dark:text-stone-100">
                        ${Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(exp)}
                            className="rounded p-1.5 text-stone-400 hover:bg-stone-100 hover:text-blue-600 dark:hover:bg-stone-700 dark:hover:text-blue-400"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(exp.id)}
                            className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

      </div>

      {/* 4. Add/Edit Expense Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-stone-800"
            >
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-700">
              <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                
                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-900/50 dark:focus:border-blue-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-900/50 dark:focus:border-blue-400"
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Flight">Flight</option>
                    <option value="Train">Train</option>
                    <option value="Food">Food</option>
                    <option value="Activity">Activity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Description</label>
                  <input 
                    type="text" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-900/50 dark:focus:border-blue-400"
                    placeholder="E.g., Dinner at central plaza"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Start Date</label>
                    <input 
                      type="date" 
                      value={formData.arrival_date}
                      onChange={(e) => setFormData({...formData, arrival_date: e.target.value})}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-900/50 dark:focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">End Date (Optional)</label>
                    <input 
                      type="date" 
                      value={formData.departure_date}
                      onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-stone-600 dark:bg-stone-900/50 dark:focus:border-blue-400"
                    />
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 font-semibold text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </TravelShell>
  );
}
