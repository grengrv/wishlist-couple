import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { db } from "@config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  onSnapshot,
} from "firebase/firestore";
import toast from "react-hot-toast";

/**
 * Custom hook quản lý phân trang wishlist (cá nhân hoặc nhóm) bằng Firestore cursor-based pagination.
 *
 * ## Firestore Indexes sử dụng:
 * - Personal: `wishlist { uid ASC, taoLuc DESC }` (index uid+taoLuc đã có)
 * - Group:    `wishlist { groupId ASC, taoLuc DESC }` (index groupId+taoLuc đã có)
 *
 * Không cần index `uid + groupId + taoLuc` vì personal mode dùng fill-loop client-side filter.
 *
 * @param {string|null} userId    - UID của user đang đăng nhập
 * @param {number}  [pageSize=20] - Số item mỗi trang
 * @param {string|null} [groupId=null] - ID nhóm. null = personal wishlist
 *
 * @returns {{
 *   items: Array<Object>,              - Danh sách items của trang hiện tại
 *   currentPage: number,               - Trang đang xem (1-indexed)
 *   totalPages: number,                - Tổng số trang
 *   totalCount: number,                - Tổng số items
 *   goToPage: (page: number) => void,  - Nhảy tới trang bất kỳ
 *   goNext: () => void,                - Sang trang kế
 *   goPrev: () => void,                - Về trang trước
 *   isLoading: boolean,                - Đang fetch dữ liệu
 *   error: string|null                 - Thông báo lỗi nếu có
 * }}
 */
export function useWishlistPagination(userId, pageSize = 20, groupId = null) {
  const [items, setItems]             = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);

  // ── Surgical updaters exposed to callers ──────────────────────────────────
  /** Patch one item in the current page by id. Merges `updates` into the item. */
  const patchItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  /** Remove one item from the current page by id. Caller handles totalCount. */
  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setTotalCount(prev => Math.max(0, prev - 1));
  }, []);

  /**
   * cursors[i] = lastVisible raw Firestore DocumentSnapshot của trang i+1.
   * Dùng để startAfter() cho trang i+2.
   * Luôn lưu raw cursor (trước khi filter client-side) để đảm bảo Firestore offset chính xác.
   */
  const cursors       = useRef([]);  // Array<DocumentSnapshot>
  const prefetchCache = useRef({});  // { [page]: items[] }
  const isMounted     = useRef(true);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // ── Reset state khi context thay đổi ─────────────────────────────────────
  const contextKey = `${userId}__${groupId ?? "personal"}`;

  // ── Fetch tổng số items ───────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    isMounted.current = true;

    // GROUP: dùng index groupId+taoLuc → đếm chính xác
    // PERSONAL: dùng index uid+taoLuc → đếm gần đúng (bao gồm group items của user)
    //           totalCount sẽ được hiệu chỉnh sau khi fetch xong trang 1
    const countQ = groupId
      ? query(collection(db, "wishlist"), where("groupId", "==", groupId))
      : query(collection(db, "wishlist"), where("uid", "==", userId));

    getCountFromServer(countQ)
      .then((snap) => {
        if (isMounted.current) setTotalCount(snap.data().count);
      })
      .catch((err) => {
        console.error("[useWishlistPagination] count error:", err);
      });

    cursors.current       = [];
    prefetchCache.current = {};
    setCurrentPage(1);
    setItems([]);

    return () => { isMounted.current = false; };
  }, [userId, groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Track current user's liked wish IDs (real-time) ──────────────────────
  const userLikes = useRef(new Set()); // Set<wishId>
  const [likesVersion, setLikesVersion] = useState(0); // bump to trigger re-render

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, "likes"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      userLikes.current = new Set(snap.docs.map(d => d.data().wishId).filter(Boolean));
      setLikesVersion(v => v + 1); // force re-enrichment
    });
    return () => unsub();
  }, [userId]);

  // ── Map raw Firestore doc → item object ──────────────────────────────────
  // isPinned is computed from pinnedBy at fetch-time; isLiked is enriched via useMemo below.
  const mapDoc = useCallback((d) => {
    const data = d.data();
    return {
      id:          d.id,
      ...data,
      isFavorite:  data.isFavorite  ?? false,
      favoriteAt:  data.favoriteAt  ?? null,
      pinnedBy:    data.pinnedBy    || [],
      pinCount:    data.pinCount    || 0,
      folderId:    data.folderId    || null,
      likeCount:   data.likeCount   || 0,
      // isPinned and isLiked are enriched in the useMemo below — not hardcoded here
    };
  }, []);

  // ── Pin-aware sort (mirrors useWishlist sort logic) ──────────────────────
  // Pinned-by-anyone items first (isFavorite), then sort by favoriteAt desc.
  // Unpinned: keep taoLuc desc (Firestore order).
  function applyPinSort(list) {
    return [...list].sort((a, b) => {
      const aPinned = a.isFavorite || (Array.isArray(a.pinnedBy) && a.pinnedBy.length > 0);
      const bPinned = b.isFavorite || (Array.isArray(b.pinnedBy) && b.pinnedBy.length > 0);
      if (aPinned !== bPinned) return bPinned ? 1 : -1;
      if (aPinned && bPinned) {
        const secA = a.favoriteAt?.seconds ?? 0;
        const secB = b.favoriteAt?.seconds ?? 0;
        if (secA !== secB) return secB - secA;
      }
      const taoLucA = a.taoLuc?.seconds ?? 0;
      const taoLucB = b.taoLuc?.seconds ?? 0;
      return taoLucB - taoLucA;
    });
  }

  // ── GROUP fetch: dùng index groupId+taoLuc, limit chính xác ─────────────
  const fetchGroupPage = useCallback(
    async (page) => {
      const cursorSnap = page > 1 ? cursors.current[page - 2] : null;
      if (page > 1 && !cursorSnap) return null;

      const constraints = [
        where("groupId", "==", groupId),
        orderBy("taoLuc", "desc"),
        limit(pageSize),
      ];
      if (cursorSnap) constraints.push(startAfter(cursorSnap));

      const snap = await getDocs(query(collection(db, "wishlist"), ...constraints));

      if (snap.docs.length > 0) {
        cursors.current[page - 1] = snap.docs[snap.docs.length - 1];
      }
      return applyPinSort(snap.docs.map(mapDoc));
    },
    [groupId, pageSize, mapDoc]
  );

  // ── PERSONAL fetch: dùng index uid+taoLuc với fill-loop ─────────────────
  //
  // Vì không có index uid+groupId+taoLuc, ta không thể dùng
  // where("groupId","==",null) trực tiếp trong Firestore query.
  // Thay vào đó: fetch theo uid+taoLuc, filter !groupId client-side,
  // lặp lại nếu chưa đủ pageSize items.
  //
  // Cursor lưu là raw Firestore doc cuối cùng đã xử lý (trước filter),
  // đảm bảo startAfter() luôn chính xác.
  const fetchPersonalPage = useCallback(
    async (page) => {
      let cursorSnap = page > 1 ? cursors.current[page - 2] : null;
      if (page > 1 && !cursorSnap) return null;

      const results     = [];
      let   lastRawDoc  = null;
      let   hasMore     = true;
      const BATCH       = Math.max(pageSize, 20); // mỗi lần fetch ít nhất 20 docs

      while (results.length < pageSize && hasMore) {
        const needed = pageSize - results.length;
        const constraints = [
          where("uid", "==", userId),
          orderBy("taoLuc", "desc"),
          limit(needed + BATCH), // fetch thêm để bù group items bị filter ra
        ];
        if (cursorSnap) constraints.push(startAfter(cursorSnap));

        // eslint-disable-next-line no-await-in-loop
        const snap = await getDocs(query(collection(db, "wishlist"), ...constraints));

        if (snap.empty) { hasMore = false; break; }

        // Lọc personal items
        const personalDocs = snap.docs.filter((d) => !d.data().groupId);
        results.push(...personalDocs.map(mapDoc));

        // Cập nhật cursor cho vòng lặp tiếp theo
        lastRawDoc = snap.docs[snap.docs.length - 1];
        cursorSnap = lastRawDoc;

        // Nếu Firestore trả về ít hơn limit → đã hết docs
        if (snap.docs.length < needed + BATCH) { hasMore = false; }
      }

      // Lưu raw cursor để trang tiếp theo startAfter() đúng
      if (lastRawDoc) {
        cursors.current[page - 1] = lastRawDoc;
      }

      return applyPinSort(results.slice(0, pageSize));
    },
    [userId, pageSize, mapDoc]
  );

  // ── Dispatch đúng fetch function theo mode ────────────────────────────────
  const fetchPage = useCallback(
    (page) => {
      if (!userId) return Promise.resolve(null);
      return groupId ? fetchGroupPage(page) : fetchPersonalPage(page);
    },
    [userId, groupId, fetchGroupPage, fetchPersonalPage]
  );

  // ── Prefetch trang kế trong background ───────────────────────────────────
  const prefetchNextPage = useCallback(
    async (page) => {
      const next = page + 1;
      if (next > totalPages) return;
      if (prefetchCache.current[next]) return;
      if (next > 1 && !cursors.current[next - 2]) return; // cursor chưa có

      try {
        const result = await fetchPage(next);
        if (result) prefetchCache.current[next] = result;
      } catch {
        // silent – prefetch thất bại không ảnh hưởng UX
      }
    },
    [fetchPage, totalPages]
  );

  // ── Chuyển trang ──────────────────────────────────────────────────────────
  const goToPage = useCallback(
    async (page) => {
      if (!userId || page < 1 || page > totalPages) return;
      if (page === currentPage) return;

      setIsLoading(true);
      setError(null);

      try {
        let result;

        // Dùng cache nếu đã prefetch
        if (prefetchCache.current[page]) {
          result = prefetchCache.current[page];
          delete prefetchCache.current[page];
        } else {
          const highestKnown = cursors.current.length; // số trang đã có cursor

          if (page > highestKnown + 1) {
            // Cần replay cursor chain: fetch tuần tự các trang trung gian
            let p = highestKnown + 1;
            while (p <= page) {
              // eslint-disable-next-line no-await-in-loop
              const mid = await fetchPage(p);
              if (!mid) break;
              if (p === page) result = mid;
              p++;
            }
          } else {
            result = await fetchPage(page);
          }
        }

        if (result && isMounted.current) {
          setItems(result);
          setCurrentPage(page);
          setTimeout(() => prefetchNextPage(page), 300);
        }
      } catch (err) {
        console.error("[useWishlistPagination] goToPage error:", err);
        const msg = "Không thể tải danh sách. Thử lại nhé!";
        setError(msg);
        toast.error(msg);
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    },
    [userId, currentPage, totalPages, fetchPage, prefetchNextPage]
  );

  // ── Load trang 1 khi context thay đổi ────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchPage(1)
      .then((result) => {
        if (!cancelled && result) {
          setItems(result);
          setCurrentPage(1);
          setTimeout(() => prefetchNextPage(1), 300);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[useWishlistPagination] initial fetch error:", err);
          setError("Không thể tải danh sách.");
          toast.error("Không thể tải danh sách.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [contextKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── refetchCurrentPage ──────────────────────────────────────────────────────
  // Re-fetches the current page from Firestore after a mutation (delete, etc.).
  // Cursor-based: keeps cursors 0..currentPage-2 (valid), clears currentPage-1..
  // Returns { isEmpty: bool } so callers can decide whether to navigate back.
  const refetchCurrentPage = useCallback(async () => {
    if (!userId) return { isEmpty: false };

    // Keep only cursors UP TO the start of currentPage; discard stale beyond.
    cursors.current = cursors.current.slice(0, currentPage - 1);
    prefetchCache.current = {};

    setIsLoading(true);
    try {
      const result = await fetchPage(currentPage);
      if (result !== null && isMounted.current) {
        setItems(result); // already pin-sorted by fetchPage
        return { isEmpty: result.length === 0 };
      }
      return { isEmpty: true };
    } catch (err) {
      console.error("[useWishlistPagination] refetchCurrentPage error:", err);
      return { isEmpty: false };
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [currentPage, fetchPage, userId]);

  // ── sortItems ────────────────────────────────────────────────────────────
  // Re-sorts current items in-place (no refetch). Call AFTER confirmed pin/unpin.
  const sortItems = useCallback(() => {
    setItems(prev => applyPinSort(prev));
  }, []);

  const goNext = useCallback(() => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  }, [currentPage, totalPages, goToPage]);

  const goPrev = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // ── Enrich pagedItems with real-time isLiked / isPinned ──────────────────
  // Runs whenever items or userLikes changes — surgical, no refetch.
  const enrichedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      isLiked:  userLikes.current.has(item.id),
      isPinned: Array.isArray(item.pinnedBy) && item.pinnedBy.includes(userId),
    }));
  // likesVersion is the reactive trigger for userLikes.current changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, likesVersion, userId]);

  return {
    items: enrichedItems,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    goNext,
    goPrev,
    isLoading,
    error,
    patchItem,
    removeItem,
    /** Re-fetch current page from Firestore. Use after delete. Returns { isEmpty }. */
    refetchCurrentPage,
    /** Re-sort current page items by pin status. Use after confirmed pin/unpin. */
    sortItems,
  };
}
