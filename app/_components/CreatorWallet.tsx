"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Plus, X, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, WalletTransaction } from '../../lib/secure-storage';

interface CreatorWalletProps {
    isAddMoneyOpen: boolean;
    onToggleAddMoney: (isOpen: boolean) => void;
}

const CreatorWallet: React.FC<CreatorWalletProps> = ({ isAddMoneyOpen, onToggleAddMoney }) => {
    const [balance, setBalance] = useState(0);
    const [addAmount, setAddAmount] = useState("");
    const [filterType, setFilterType] = useState<"All" | "credit" | "debit">("All");
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

    const loadWalletData = async () => {
        try {
            const currentBalance = await db.getBalance();
            const txs = await db.getTransactions();
            setBalance(currentBalance);
            setTransactions(txs);
        } catch (e) {
            console.error("Error loading wallet data:", e);
        }
    };

    // Load data on mount and subscribe to updates
    useEffect(() => {
        loadWalletData();
        const unsubscribe = db.subscribe(loadWalletData);
        return () => unsubscribe();
    }, []);

    const filteredTransactions = useMemo(() => {
        if (filterType === "All") return transactions;
        return transactions.filter(t => t.type === filterType);
    }, [transactions, filterType]);

    const totalIncome = transactions.filter(t => t.type === "credit").reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "debit").reduce((acc, curr) => acc + curr.amount, 0);

    const handleAddMoney = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(addAmount);
        if (amount > 0) {
            const newBalance = balance + amount;

            // 1. Update Balance
            await db.updateBalance(newBalance);

            // 2. Add Transaction
            await db.addTransaction({
                type: 'credit',
                title: 'Wallet Top-up',
                amount: amount,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Completed'
            });

            setAddAmount("");
            onToggleAddMoney(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto no-scrollbar">
            <div className="p-6 space-y-6">
                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-purple-600/20 border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Wallet className="w-6 h-6 text-cyan-400" />
                            </div>
                            <span className="text-gray-400 font-medium">Wallet Balance</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-8">
                            ${balance.toLocaleString()}
                        </h1>

                        <div className="flex gap-4">
                            <button
                                onClick={() => onToggleAddMoney(true)}
                                className="flex-1 py-3 bg-cyan-500 text-black rounded-xl font-bold hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                            >
                                <Plus className="w-5 h-5" />
                                Add Money
                            </button>
                            <button className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/10">
                                <ArrowUpRight className="w-5 h-5" />
                                Withdraw
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Financial Overview */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-2 text-green-400">
                            <TrendingUp className="w-5 h-5" />
                            <span className="font-bold">Income</span>
                        </div>
                        <p className="text-2xl font-bold text-white">${totalIncome.toLocaleString()}</p>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (totalIncome / (totalIncome + totalExpense || 1)) * 100)}%` }} />
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-2 text-red-400">
                            <TrendingDown className="w-5 h-5" />
                            <span className="font-bold">Expense</span>
                        </div>
                        <p className="text-2xl font-bold text-white">${totalExpense.toLocaleString()}</p>
                        <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${Math.min(100, (totalExpense / (totalIncome + totalExpense || 1)) * 100)}%` }} />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors cursor-pointer group">
                        <CreditCard className="w-7 h-7 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-white text-sm">Payment Methods</h3>
                        <p className="text-xs text-gray-400">Manage cards</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors cursor-pointer group">
                        <History className="w-7 h-7 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-white text-sm">Statements</h3>
                        <p className="text-xs text-gray-400">Download reports</p>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-400" />
                            Transaction History
                        </h2>
                        <select
                            className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                        >
                            <option value="All">All</option>
                            <option value="credit">Incoming</option>
                            <option value="debit">Outgoing</option>
                        </select>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                        <AnimatePresence>
                            {filteredTransactions.map((tx) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center justify-between group p-3 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                                                {tx.title}
                                            </h4>
                                            <p className="text-xs text-gray-500">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-white'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {filteredTransactions.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-6">No transactions found.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Money Modal */}
            <AnimatePresence>
                {isAddMoneyOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => onToggleAddMoney(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl"
                        >
                            <button
                                onClick={() => onToggleAddMoney(false)}
                                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                                <Plus className="w-6 h-6 text-cyan-400" />
                                Add Money
                            </h2>

                            <form onSubmit={handleAddMoney} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Amount ($)</label>
                                    <input
                                        autoFocus
                                        required
                                        type="number"
                                        min="1"
                                        placeholder="Enter amount..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-cyan-500/50"
                                        value={addAmount}
                                        onChange={e => setAddAmount(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    {[100, 500, 1000].map(amt => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setAddAmount(amt.toString())}
                                            className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:border-cyan-500/30 transition-all"
                                        >
                                            +${amt}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                                >
                                    Confirm Payment
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CreatorWallet;
