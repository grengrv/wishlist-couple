import { useState, useMemo, useEffect, memo, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Stats from "@components/wishlist/Stats";
import WishList from "@components/wishlist/WishList";
import ItemModal from "@components/wishlist/ItemModal";
import FolderList from "@components/wishlist/FolderList";
import WishlistPagination from "@components/wishlist/WishlistPagination";
import { useFolders } from "@hooks/useFolders";
import { useWishlistPagination } from "@hooks/useWishlistPagination";
import { useWishlist } from "@hooks/useWishlist";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ADMIN_EMAIL } from "@constants";
import { notifyXoaWish } from "@utils/notify";
import { sileo } from "sileo";
import { useLanguage } from "@context/LanguageContext";

// ── Skeleton Loader ───────────────────────────────────────────────────────────

const WishlistSkeleton = memo(function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border-primary/30 bg-bg-secondary/40 overflow-hidden animate-pulse"
        >
          <div className="h-[180px] bg-bg-secondary/60" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-bg-secondary rounded-full w-3/4" />
            <div className="h-3 bg-bg-secondary rounded-full w-1/2" />
            <div className="h-3 bg-bg-secondary rounded-full w-full" />
          </div>
        </div>
      ))}
    </div>
  );
});

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PersonalPage({ user, userProfile }) {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // ── Pagination hook (Firestore cursor-based) ────────────────────────────────
  const {
    items: pagedItems,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    goNext,
    goPrev,
    isLoading: pageLoading,
    patchItem,
    removeItem,
    refetchCurrentPage,
    sortItems,
  } = useWishlistPagination(user?.uid, 20);

  // ── Mutations hook (API calls + notifications) ───────────────────────────────
  const {
    xoaMon,
    thichMon,
    binhLuanMon,
    xoaBinhLuan,
    thichBinhLuan,
    toggleFavorite,
    moveToFolder,
  } = useWishlist(user, userProfile, null);

  const { folders, loading: foldersLoading, addFolder, updateFolder, deleteFolder } = useFolders(user);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [showMyPins, setShowMyPins] = useState(false);

  // Clear pin filter when folder changes
  const handleSelectFolder = (id) => {
    setActiveFolderId(id);
    setShowMyPins(false);
  };

  const myPinCount = pagedItems.filter(i => i.isPinned).length;

  // ── URL sync: ?page=N ───────────────────────────────────────────────────────
  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    if (isNaN(urlPage) || urlPage < 1) {
      // Trang không hợp lệ → về trang 1
      const next = new URLSearchParams(searchParams);
      next.set("page", "1");
      setSearchParams(next, { replace: true });
      return;
    }
    // Nếu trang trong URL vượt quá tổng số trang đã biết → redirect về 1
    if (totalPages > 1 && urlPage > totalPages) {
      const next = new URLSearchParams(searchParams);
      next.set("page", "1");
      setSearchParams(next, { replace: true });
      goToPage(1);
      return;
    }
    // Sync từ URL vào hook (chỉ khi khác nhau)
    if (urlPage !== currentPage) {
      goToPage(urlPage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Khi hook thay đổi currentPage (goNext/goPrev/goToPage) → update URL
  const handleGoToPage = (page) => {
    goToPage(page);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    // Xóa wishId khi đổi trang
    next.delete("wishId");
    setSearchParams(next, { replace: false });
  };

  const handleGoNext = () => handleGoToPage(currentPage + 1);
  const handleGoPrev = () => handleGoToPage(currentPage - 1);

  // ── Filters ───────────────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let list = pagedItems;
    if (showMyPins)  list = list.filter(i => i.isPinned);
    if (activeFolderId) list = list.filter(i => i.folderId === activeFolderId);
    return list;
  }, [pagedItems, showMyPins, activeFolderId]);

  // ── Deep-link: ?wishId=xxx ──────────────────────────────────────────────────
  useEffect(() => {
    const wishId = searchParams.get("wishId");
    if (wishId && pagedItems.length > 0) {
      const item = pagedItems.find((i) => i.id === wishId);
      if (item && selectedItem?.id !== item.id) {
        setSelectedItem(item);
      }
    }
  }, [searchParams, pagedItems, selectedItem?.id]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  // BUG 1 FIX: Optimistic delete → refetch on success so page 2 items shift in
  const handleXoa = useCallback(async (id) => {
    if (selectedItem?.id === id) setSelectedItem(null);

    // Optimistic: remove immediately for instant feedback
    removeItem(id);
    notifyXoaWish();

    const ok = await xoaMon(id);
    if (!ok) {
      sileo.error({ title: "Xóa thất bại 😢", description: "Thử lại nhé!" });
      refetchCurrentPage(); // restore correct state
      return;
    }

    // Re-fetch so items from next page shift into current page
    const { isEmpty } = await refetchCurrentPage();
    if (isEmpty && currentPage > 1) {
      handleGoToPage(currentPage - 1);
    }
  }, [selectedItem, removeItem, xoaMon, refetchCurrentPage, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // BUG 2 FIX: Optimistic like count patch
  const handleThichMon = useCallback(async (item, reactionType = "heart") => {
    const wasLiked = item.isLiked;
    // Optimistic update
    patchItem(item.id, {
      isLiked:   !wasLiked,
      likeCount: Math.max(0, (item.likeCount || 0) + (wasLiked ? -1 : 1)),
    });

    const ok = await thichMon(item, reactionType);
    if (!ok) {
      // Revert
      patchItem(item.id, { isLiked: wasLiked, likeCount: item.likeCount || 0 });
      sileo.error({ title: "Không thể cập nhật cảm xúc 💔", description: "Thử lại nhé!" });
    }
  }, [patchItem, thichMon]);

  // BUG 3 FIX: Optimistic pin toggle — sortItems after confirmed success
  const [pendingPinIds, setPendingPinIds] = useState(new Set());
  const handleToggleFavorite = useCallback(async (item) => {
    if (pendingPinIds.has(item.id)) return;

    const wasPinned   = item.isPinned;
    const wasPinnedBy = item.pinnedBy || [];
    const newPinnedBy = wasPinned
      ? wasPinnedBy.filter(uid => uid !== user?.uid)
      : [...wasPinnedBy, user?.uid];

    // Optimistic update (no sort yet — avoid visual jumping)
    setPendingPinIds(prev => new Set([...prev, item.id]));
    patchItem(item.id, {
      isPinned:    !wasPinned,
      isFavorite:  !wasPinned,
      pinnedBy:    newPinnedBy,
      pinCount:    Math.max(0, (item.pinCount || 0) + (wasPinned ? -1 : 1)),
    });

    const ok = await toggleFavorite(item);
    setPendingPinIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });

    if (ok) {
      // Sort AFTER confirmed — pinned item floats to top
      sortItems();
    } else {
      // Revert
      patchItem(item.id, {
        isPinned:   wasPinned,
        isFavorite: wasPinned,
        pinnedBy:   wasPinnedBy,
        pinCount:   item.pinCount || 0,
      });
      sileo.error({ title: "Ghim thất bại 📌", description: "Thử lại nhé!" });
    }
  }, [pendingPinIds, patchItem, sortItems, toggleFavorite, user?.uid]);

  const handleCloseModal = () => {
    setSelectedItem(null);
    if (searchParams.has("wishId")) {
      const next = new URLSearchParams(searchParams);
      next.delete("wishId");
      setSearchParams(next);
    }
  };

  const isLoading = pageLoading || foldersLoading;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 relative overflow-hidden">

      {/* 1. Floating Profile Intro */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-20 bg-card-bg/40 backdrop-blur-md p-8 rounded-[40px] border border-border-primary/60 shadow-[0_20px_50px_rgba(236,72,153,0.05)]">
        <div className="relative group">
          <div className="absolute -inset-2 from-pink-300 to-rose-300 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-card-bg shadow-xl">
            <img
              src={userProfile?.avatar || ""}
              alt="Avatar"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight">
            {t("hello")}, <span className="text-pink-500">{userProfile?.username || t("default_friend")}!</span>
          </h2>
          <p className="text-text-secondary font-bold mt-2 text-lg">
            {t("personal_subtitle")}
          </p>
        </div>

        <button
          onClick={() => navigate("/add")}
          className="w-16 h-16 bg-text-primary text-bg-primary rounded-[24px] hover:bg-pink-600 hover:rotate-12 hover:scale-110 active:scale-95 transition-all duration-500 flex items-center justify-center text-3xl font-light"
        >
          ＋
        </button>
      </div>

      <Stats items={pagedItems} />

      <div className="mt-20">
        <div className="lg:col-span-2">
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col gap-8">
                {/* Skeleton header */}
                <div className="flex items-center justify-between px-2 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-pink-500/30 rounded-full" />
                    <div className="space-y-1.5">
                      <div className="h-4 bg-bg-secondary rounded-full w-28" />
                      <div className="h-3 bg-bg-secondary rounded-full w-16" />
                    </div>
                  </div>
                </div>
                <WishlistSkeleton />
              </div>
            ) : (
              <>
                <FolderList
                  folders={folders}
                  items={pagedItems}
                  activeFolderId={activeFolderId}
                  onSelectFolder={handleSelectFolder}
                  onAddFolder={addFolder}
                  onUpdateFolder={updateFolder}
                  onDeleteFolder={deleteFolder}
                  onDropToFolder={(wishId, folderId) => moveToFolder(wishId, folderId)}
                />

                {/* ── My Pins filter chip ── */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <button
                    onClick={() => { setShowMyPins(p => !p); setActiveFolderId(null); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 ${
                      showMyPins
                        ? "bg-pink-hot text-white shadow-lg shadow-pink-hot/25"
                        : "bg-card-bg border border-border-primary text-text-muted hover:border-pink-brand/40 hover:text-pink-500"
                    }`}
                  >
                    <span className="text-sm">📌</span>
                    Đã ghim
                    {myPinCount > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        showMyPins ? "bg-white/20 text-white" : "bg-pink-500/10 text-pink-500"
                      }`}>
                        {myPinCount}
                      </span>
                    )}
                  </button>

                  {showMyPins && filteredItems.length === 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-text-muted italic"
                    >
                      Chưa có món nào được ghim ✨
                    </motion.p>
                  )}
                </motion.div>

                {/* AnimatePresence bọc list để animate khi đổi trang */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <WishList
                      items={filteredItems}
                      folders={folders}
                      onSelectItem={setSelectedItem}
                      onToggleFavorite={handleToggleFavorite}
                      user={user}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Pagination UI */}
                <WishlistPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  isLoading={pageLoading}
                  goToPage={handleGoToPage}
                  goNext={handleGoNext}
                  goPrev={handleGoPrev}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <ItemModal
        item={pagedItems.find((i) => i.id === selectedItem?.id) || selectedItem}
        onClose={handleCloseModal}
        onDelete={handleXoa}
        user={user}
        userProfile={userProfile}
        adminEmail={ADMIN_EMAIL}
        onLike={handleThichMon}
        onComment={binhLuanMon}
        onDeleteComment={xoaBinhLuan}
        onLikeComment={thichBinhLuan}
        onToggleFavorite={handleToggleFavorite}
      />

    </div>
  );
}
