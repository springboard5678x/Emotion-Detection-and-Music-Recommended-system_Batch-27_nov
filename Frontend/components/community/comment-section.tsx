"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Heart, MessageCircle, MoreHorizontal, CornerDownRight } from 'lucide-react';
import { postComment, deleteComment, toggleCommentLike } from '@/lib/supabase';
import { toast } from 'sonner';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    parent_id: string | null;
    likes_count: number;
    is_liked: boolean;
    profile: {
        full_name: string;
        avatar_url: string | null;
    };
}

interface CommentSectionProps {
    playlistId: string;
    comments: Comment[];
    currentUserId?: string;
    onCommentAdded: () => void;
}

interface CommentItemProps {
    comment: Comment;
    currentUserId?: string;
    replyingTo: string | null;
    replyContent: string;
    isSubmitting: boolean;
    onLikeToggle: (comment: Comment) => void;
    onDelete: (commentId: string) => void;
    onReplyClick: (commentId: string | null) => void;
    onReplySubmit: (parentId: string) => void;
    onReplyContentChange: (content: string) => void;
    getReplies: (parentId: string) => Comment[];
    isReply?: boolean;
}

const CommentItem = ({
    comment,
    currentUserId,
    replyingTo,
    replyContent,
    isSubmitting,
    onLikeToggle,
    onDelete,
    onReplyClick,
    onReplySubmit,
    onReplyContentChange,
    getReplies,
    isReply = false
}: CommentItemProps) => {
    const isOwner = currentUserId === comment.user_id;
    const avatarSrc = comment.profile?.avatar_url;
    const name = comment.profile?.full_name || "User";
    const timeAgo = new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const replies = getReplies(comment.id);
    const hasReplies = replies.length > 0;
    const replyInputRef = useRef<HTMLTextAreaElement>(null);

    // Focus reply input
    useEffect(() => {
        if (replyingTo === comment.id && replyInputRef.current) {
            replyInputRef.current.focus();
        }
    }, [replyingTo, comment.id]);

    return (
        <div className={`flex flex-col ${isReply ? 'mt-3' : 'mb-6'}`}>
            <div className="flex gap-3">
                {/* Avatar */}
                <div className={`rounded-full border border-black/10 overflow-hidden bg-white shrink-0 flex items-center justify-center ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
                    {avatarSrc ? (
                        <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-xs text-black/70">{(name[0] || '?').toUpperCase()}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className={`bg-white border border-black/5 rounded-2xl rounded-tl-none p-4 shadow-sm relative group/card ${isReply ? 'bg-gray-50/50' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">{name}</span>
                            <span className="text-xs font-bold text-black/30">{timeAgo}</span>
                        </div>
                        <p className="text-black/80 font-medium text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                        {/* Actions Row */}
                        <div className="flex items-center gap-4 mt-3">
                            <button
                                onClick={() => onLikeToggle(comment)}
                                className={`group flex items-center gap-1.5 text-xs font-bold transition-colors ${comment.is_liked ? 'text-[#FB58B4]' : 'text-black/40 hover:text-[#FB58B4]'}`}
                            >
                                <Heart className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${comment.is_liked ? 'fill-current' : ''}`} />
                                {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                            </button>

                            <button
                                onClick={() => onReplyClick(replyingTo === comment.id ? null : comment.id)}
                                className="flex items-center gap-1.5 text-xs font-bold text-black/40 hover:text-black/60 transition-colors"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Reply
                            </button>

                            {isOwner && (
                                <button
                                    onClick={() => onDelete(comment.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors ml-auto"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Reply Input */}
                    <AnimatePresence>
                        {replyingTo === comment.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 ml-2 flex gap-3 overflow-hidden"
                            >
                                <div className="w-8 flex justify-center pt-2">
                                    <CornerDownRight className="w-4 h-4 text-black/20" />
                                </div>
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={replyInputRef}
                                        value={replyContent}
                                        onChange={(e) => onReplyContentChange(e.target.value)}
                                        placeholder={`Reply to ${name}...`}
                                        className="w-full bg-white border border-black/10 rounded-xl p-3 pr-10 text-sm font-medium focus:outline-none focus:border-black/30 resize-none min-h-[40px]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                onReplySubmit(comment.id);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => onReplySubmit(comment.id)}
                                        disabled={!replyContent.trim() || isSubmitting}
                                        className="absolute right-2 bottom-2 p-1.5 bg-black text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-all"
                                    >
                                        <Send className="w-3 h-3" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Nested Replies */}
                    {hasReplies && (
                        <div className="mt-3 pl-4 border-l-2 border-black/5 space-y-3">
                            {replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUserId={currentUserId}
                                    replyingTo={replyingTo}
                                    replyContent={replyContent}
                                    isSubmitting={isSubmitting}
                                    onLikeToggle={onLikeToggle}
                                    onDelete={onDelete}
                                    onReplyClick={onReplyClick}
                                    onReplySubmit={onReplySubmit}
                                    onReplyContentChange={onReplyContentChange}
                                    getReplies={getReplies}
                                    isReply={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import { ConfirmModal } from '../ui/confirm-modal';

// ... (previous imports and interfaces remain the same)

export function CommentSection({ playlistId, comments, currentUserId, onCommentAdded }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize main textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [newComment]);

    const handlePostComment = async (parentId?: string) => {
        const content = parentId ? replyContent : newComment;
        if (!content.trim() || !currentUserId) return;

        setIsSubmitting(true);
        try {
            await postComment(playlistId, currentUserId, content.trim(), parentId);
            if (parentId) {
                setReplyingTo(null);
                setReplyContent('');
            } else {
                setNewComment('');
            }
            onCommentAdded();
            toast.success(parentId ? "Reply posted!" : "Comment posted!");
        } catch (error: any) {
            console.error("Error posting comment:", error);
            toast.error(error.message || "Failed to post comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (commentId: string) => {
        setCommentToDelete(commentId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!commentToDelete) return;
        try {
            await deleteComment(commentToDelete);
            onCommentAdded();
            toast.success("Comment deleted.");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment.");
        } finally {
            setIsDeleteModalOpen(false);
            setCommentToDelete(null);
        }
    };

    const handleLikeToggle = async (comment: Comment) => {
        if (!currentUserId) {
            toast.error("Please login to like comments.");
            return;
        }
        try {
            // Optimistic update could happen here, but simpler to just refetch for now or let parent handle
            await toggleCommentLike(currentUserId, comment.id);
            onCommentAdded(); // Refetch to show new count/state
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    };

    // Helper: Organize comments into threads
    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-black uppercase tracking-tight">Comments ({comments.length})</h3>

            {/* Main Input Area */}
            {currentUserId ? (
                <div className="flex gap-4 mb-8">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full bg-white border border-black/10 rounded-2xl p-4 pr-12 font-medium focus:outline-none focus:border-black/30 resize-none min-h-[60px] max-h-[200px] transition-colors shadow-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostComment();
                                }
                            }}
                        />
                        <button
                            onClick={() => handlePostComment()}
                            disabled={!newComment.trim() || isSubmitting}
                            className="absolute right-3 bottom-3 p-2 bg-black text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 p-6 rounded-3xl border border-black/5 text-center text-sm font-bold text-black/40 mb-8">
                    Log in to join the conversation.
                </div>
            )}

            {/* Comment List */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {rootComments.map((comment) => (
                        <motion.div
                            key={comment.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <CommentItem
                                comment={comment}
                                currentUserId={currentUserId}
                                replyingTo={replyingTo}
                                replyContent={replyContent}
                                isSubmitting={isSubmitting}
                                onLikeToggle={handleLikeToggle}
                                onDelete={handleDeleteClick}
                                onReplyClick={setReplyingTo}
                                onReplySubmit={handlePostComment}
                                onReplyContentChange={setReplyContent}
                                getReplies={getReplies}
                            />
                        </motion.div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-center py-12 text-black/30 font-bold italic">No comments yet. Be the first!</p>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Comment?"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}
