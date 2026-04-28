import { useState } from "react";
import { useLanguage } from "@context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@components/ui/ConfirmModal";

export default function FolderList({ 
  folders, 
  activeFolderId, 
  onSelectFolder, 
  onAddFolder, 
  onUpdateFolder, 
  onDeleteFolder,
  onDropToFolder
}) {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const success = await onAddFolder(newName);
    if (success) {
      setNewName("");
      setIsAdding(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !editingFolder) return;
    const success = await onUpdateFolder(editingFolder.id, newName);
    if (success) {
      setNewName("");
      setEditingFolder(null);
    }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[11px] font-black uppercase tracking-[2px] text-text-muted opacity-60">
          {t("folders") || "Thư mục"}
        </h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-6 h-6 rounded-full bg-bg-secondary border border-border-primary flex items-center justify-center text-text-primary hover:bg-pink-500 hover:text-white transition-all text-sm"
        >
          ＋
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* "All" Folder */}
        <FolderItem 
          name={t("all_items") || "Tất cả"} 
          isActive={activeFolderId === null} 
          onClick={() => onSelectFolder(null)}
          onDrop={(wishId) => onDropToFolder(wishId, null)}
        />

        {folders.map(folder => (
          <FolderItem 
            key={folder.id}
            name={folder.name}
            isActive={activeFolderId === folder.id}
            onClick={() => onSelectFolder(folder.id)}
            onDrop={(wishId) => onDropToFolder(wishId, folder.id)}
            onEdit={() => {
              setEditingFolder(folder);
              setNewName(folder.name);
            }}
            onDelete={() => setFolderToDelete(folder)}
          />
        ))}

        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onSubmit={handleAdd}
              className="flex items-center gap-2 bg-card-bg p-1 rounded-full border border-border-primary shadow-sm"
            >
              <input 
                autoFocus
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={t("folder_name_placeholder") || "Tên thư mục..."}
                className="bg-transparent border-none outline-none px-3 py-1 text-sm font-bold text-text-primary w-32"
                onBlur={() => !newName && setIsAdding(false)}
              />
              <button type="submit" className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px]">✓</button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      {editingFolder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-secondary p-6 rounded-[32px] border border-border-primary shadow-2xl w-full max-w-[320px]"
          >
            <h4 className="text-lg font-black text-text-primary mb-4">Sửa thư mục</h4>
            <input 
              autoFocus
              type="text" 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full px-4 py-3 bg-bg-primary rounded-2xl border border-border-primary font-bold text-text-primary mb-4 outline-none focus:border-pink-500 transition-colors"
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setEditingFolder(null)}
                className="flex-1 py-3 rounded-2xl font-bold text-text-muted hover:bg-bg-primary transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleUpdate}
                className="flex-1 py-3 bg-pink-500 text-white rounded-2xl font-black shadow-lg shadow-pink-500/20"
              >
                {t("save")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

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

function FolderItem({ name, isActive, onClick, onDrop, onEdit, onDelete }) {
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
    <div 
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        group relative px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 flex items-center gap-2 border
        ${isActive 
          ? "bg-text-primary text-bg-primary border-text-primary shadow-lg scale-105" 
          : "bg-bg-secondary text-text-muted border-border-primary hover:border-pink-300 hover:text-text-primary hover:bg-card-hover"
        }
        ${isOver ? "scale-110 ring-2 ring-pink-500 ring-offset-2 border-pink-500 bg-pink-500/10" : ""}
      `}
    >
      <span className="text-[12px] font-black uppercase tracking-wider truncate max-w-[120px]">{name}</span>
      
      {onEdit && (
        <div className="hidden group-hover:flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-5 h-5 rounded-full hover:bg-black/5 flex items-center justify-center text-[10px]"
          >
            ✎
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-5 h-5 rounded-full hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-[10px]"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
