"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Continue",
    cancelText = "Cancel",
    isDestructive = false
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-md z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-sm rounded-[32px] border border-black/5 shadow-2xl overflow-hidden pointer-events-auto flex flex-col">

                            {/* Header */}
                            <div className="p-6 pb-2 flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-black'}`}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-gray-100 text-black/60 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-6">
                                <h2 className="text-xl font-black uppercase text-black tracking-tight mb-2">
                                    {title}
                                </h2>
                                <p className="text-black/60 font-medium text-sm leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-gray-50/50 border-t border-black/5 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-white border border-black/5 text-black font-bold uppercase text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => { onConfirm(); onClose(); }}
                                    className={`flex-1 font-bold uppercase text-sm py-3 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-white flex items-center justify-center gap-2 ${isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-black hover:bg-zinc-800'}`}
                                >
                                    {isDestructive && <Trash2 className="w-4 h-4" />}
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
