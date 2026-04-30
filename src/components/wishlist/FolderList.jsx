import { useState, useRef } from "react";
import { useLanguage } from "@context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@components/ui/ConfirmModal";

const FOLDER_COLORS = [
  "#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#06b6d4"
];

const COMMON_EMOJIS = ["📁", "🎁", "💖", "⭐", "🍕", "✈️", "🏠", "📚", "🎮", "🎬", "👗", "🍷"];

export default function FolderList({ 
  folders, 
  items = [],
  activeFolderId, 
  onSelectFolder, 
  onAddFolder, 
  onUpdateFolder, 
  onDeleteFolder,
  onDropToFolder
}) {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false); // false | 'add' | 'edit'
  const [currentFolder, setCurrentFolder] = useState(null);
  const [formData, setFormData] = useState({ name: "", emoji: "📁", color: "#ec4899" });
  const [folderToDelete, setFolderToDelete] = useState(null);

  const getFolderCount = (folderId) => {
    if (folderId === null) return items.length;
    return items.filter(item => item.folderId === folderId).length;
  };

  const openAddModal = () => {
    setFormData({ name: "", emoji: "📁", color: "#ec4899" });
    setCurrentFolder(null);
    setShowModal('add');
  };

  const openEditModal = (folder) => {
    setFormData({ name: folder.name, emoji: folder.emoji || "📁", color: folder.color || "#ec4899" });
    setCurrentFolder(folder);
    setShowModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let success = false;
    if (showModal === 'add') {
      success = await onAddFolder(formData.name, formData.emoji, formData.color);
    } else {
      success = await onUpdateFolder(currentFolder.id, formData.name, formData.emoji, formData.color);
    }

    if (success) {
      setShowModal(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
          <h3 className="text-[15px] font-black uppercase tracking-[3px] text-text-primary">
            {t("folders") || "Bộ sưu tập"}
          </h3>
        </div>
        <button 
          onClick={openAddModal}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-bg-secondary border border-border-primary hover:border-pink-500/50 hover:bg-pink-500/5 transition-all shadow-sm active:scale-95"
        >
          <span className="text-pink-500 font-bold text-lg group-hover:scale-125 transition-transform leading-none">＋</span>
          <span className="text-[12px] font-black uppercase tracking-wider text-text-primary group-hover:text-pink-500 transition-colors">Thêm mới</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 px-2">
        {/* "All" Folder */}
        <FolderItem 
          name={t("all_items") || "Tất cả"} 
          emoji="📦"
          color="#6366f1"
          count={getFolderCount(null)}
          isActive={activeFolderId === null} 
          onClick={() => onSelectFolder(null)}
          onDrop={(wishId) => onDropToFolder(wishId, null)}
        />

        {folders.map(folder => (
          <FolderItem 
            key={folder.id}
            name={folder.name}
            emoji={folder.emoji || "📁"}
            color={folder.color || "#ec4899"}
            count={getFolderCount(folder.id)}
            isActive={activeFolderId === folder.id}
            onClick={() => onSelectFolder(folder.id)}
            onDrop={(wishId) => onDropToFolder(wishId, folder.id)}
            onEdit={() => openEditModal(folder)}
            onDelete={() => setFolderToDelete(folder)}
          />
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-bg-secondary w-full max-w-[400px] rounded-[40px] border border-border-primary shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black text-text-primary tracking-tight">
                    {showModal === 'add' ? "Tạo thư mục mới" : "Tùy chỉnh thư mục"}
                  </h4>
                  <button type="button" onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Name Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-[2px] text-text-muted opacity-60 ml-2">Tên thư mục</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Quà sinh nhật..."
                      className="w-full px-6 py-4 bg-bg-primary rounded-3xl border border-border-primary font-bold text-text-primary outline-none focus:border-pink-500 transition-all text-lg shadow-inner"
                    />
                  </div>

                  {/* Emoji Picker */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-black uppercase tracking-[2px] text-text-muted opacity-60 ml-2">Biểu tượng</label>
                    <div className="grid grid-cols-6 gap-2">
                      {COMMON_EMOJIS.map(e => (
                        <button 
                          key={e}
                          type="button"
                          onClick={() => setFormData({ ...formData, emoji: e })}
                          className={`h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${formData.emoji === e ? 'bg-pink-500 text-white scale-110 shadow-lg shadow-pink-500/20' : 'bg-bg-primary hover:bg-card-hover border border-border-primary'}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-black uppercase tracking-[2px] text-text-muted opacity-60 ml-2">Màu sắc chủ đề</label>
                    <div className="flex flex-wrap gap-2.5 justify-between">
                      {FOLDER_COLORS.map(c => (
                        <button 
                          key={c}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: c })}
                          style={{ backgroundColor: c }}
                          className={`w-10 h-10 rounded-full transition-all border-4 ${formData.color === c ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 rounded-[24px] font-black text-text-muted hover:bg-bg-primary transition-all border border-transparent hover:border-border-primary"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    style={{ backgroundColor: formData.color }}
                    className="flex-1 py-4 text-white rounded-[24px] font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all shadow-black/10"
                  >
                    {showModal === 'add' ? "Tạo ngay" : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={!!folderToDelete}
        title={t("delete_folder_title")}
        message={t("delete_folder_msg", { folderName: folderToDelete?.name })}
        onConfirm={async () => {
          await onDeleteFolder(folderToDelete.id);
          setFolderToDelete(null);
        }}
        onCancel={() => setFolderToDelete(null)}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        variant="danger"
      />
    </div>
  );
}

function FolderItem({ name, emoji, color, count, isActive, onClick, onDrop, onEdit, onDelete }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const wishId = e.dataTransfer.getData("wishId");
    if (wishId) {
      onDrop(wishId);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        group relative flex-1 min-w-[150px] max-w-[200px] h-[84px] rounded-[32px] cursor-pointer transition-all duration-300 flex flex-col justify-center p-4 border overflow-hidden
        ${isActive 
          ? "bg-bg-secondary shadow-xl" 
          : "bg-bg-secondary/40 border-border-primary/50 hover:bg-bg-secondary hover:border-pink-500/30"
        }
        ${isOver ? "ring-4 ring-pink-500 ring-offset-2 scale-105 bg-pink-500/10 z-10" : ""}
      `}
      style={{ 
        borderColor: isActive ? color : undefined,
        borderWidth: isActive ? "2.5px" : "1px"
      }}
    >
      {/* Background Glow */}
      {isActive && (
        <div 
          className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-10"
          style={{ backgroundColor: color }}
        ></div>
      )}

      <div className="flex items-center gap-3 relative z-10">
        <div 
          className="w-12 h-12 rounded-[20px] flex items-center justify-center text-2xl flex-shrink-0 shadow-sm border border-white/10"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {emoji}
        </div>
        
        <div className="flex flex-col min-w-0 flex-1">
          <span className={`text-[14px] font-black tracking-tight truncate ${isActive ? "text-text-primary" : "text-text-muted opacity-80"}`}>
            {name}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-40">{count} {count === 1 ? "wish" : "wishes"}</span>
          </div>
        </div>
      </div>
      
      {onEdit && (
        <div className={`absolute top-2 right-2 flex items-center gap-1.5 transition-all duration-300 transform z-20 ${
          isActive 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
        }`}>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Sửa thư mục"
            className="w-8 h-8 rounded-xl bg-bg-primary/90 backdrop-blur-md border border-border-primary flex items-center justify-center text-text-muted hover:text-pink-500 hover:border-pink-500/30 transition-all shadow-sm active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Xóa thư mục"
            className="w-8 h-8 rounded-xl bg-bg-primary/90 backdrop-blur-md border border-border-primary flex items-center justify-center text-text-muted hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-sm active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  );
}
