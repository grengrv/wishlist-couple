import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@config/firebase";
import { useGroups } from "@hooks/useGroups";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { useLanguage } from "@context/LanguageContext";
import { notifyThamGiaNhom, notifyError } from "@utils/notify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function InvitePage({ user, userProfile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { thamGiaNhom } = useGroups(user, userProfile);
  const { t } = useLanguage();
  const [group, setGroup] = useState(null);
  const [status, setStatus] = useState("loading");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    async function fetchGroup() {
      try {
        const snap = await getDoc(doc(db, "groups", id));
        if (snap.exists()) {
          const gData = snap.data();
          setGroup(gData);
          if (gData.members?.includes(user?.uid)) {
            navigate(`/groups/${id}`);
          } else {
            setStatus("ready");
          }
        } else {
          setStatus("not_found");
        }
      } catch (err) {
        console.error(err);
        setStatus("not_found");
      }
    }
    if (user) fetchGroup();
  }, [id, user, navigate]);

  async function handleJoin() {
    setJoinError(null);

    if (group.inviteCode) {
      if (inviteCodeInput.trim().toUpperCase() !== group.inviteCode.toUpperCase()) {
        const errorMsg = t("invite_code_incorrect") || "Mã mời không chính xác. Vui lòng kiểm tra lại!";
        setJoinError(errorMsg);
        notifyError(errorMsg);
        return;
      }
    }

    setStatus("joining");
    try {
      await thamGiaNhom(id);
      notifyThamGiaNhom();
      navigate(`/groups/${id}`);
    } catch (err) {
      console.error(err);
      const errorMsg = t("join_failed") || "Tham gia thất bại, vui lòng thử lại!";
      notifyError(errorMsg);
      setStatus("ready");
    }
  }

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden px-5 py-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {group?.bannerUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-2 md:inset-5 z-0 rounded-[40px] md:rounded-[60px] overflow-hidden backdrop-blur-2xl bg-white/[0.03] border border-white/5"
            >
              <img 
                src={group.bannerUrl} 
                alt="" 
                className="w-full h-full object-cover blur-[100px] opacity-20 dark:opacity-30 scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/50 via-transparent to-bg-primary/80" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
              <p className="text-pink-500 font-bold tracking-widest uppercase text-[10px]">{t("loading")}</p>
            </motion.div>
          )}

          {status === "not_found" && (
            <motion.div
              key="not_found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full bg-card-bg/60 backdrop-blur-xl p-10 rounded-[40px] border border-border-primary shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 text-3xl mb-6 shadow-inner">🚫</div>
              <h2 className="text-2xl font-black text-text-primary mb-3">Oops!</h2>
              <p className="text-[15px] text-text-muted font-medium mb-8 leading-relaxed">
                {t("group_not_found") || "Nhóm không tồn tại hoặc đã bị giải tán."}
              </p>
              <Button 
                variant="primary" 
                className="w-full rounded-2xl h-14 font-black tracking-widest uppercase text-xs"
                onClick={() => navigate("/")}
              >
                {t("back_to_home") || "Về trang chủ"}
              </Button>
            </motion.div>
          )}

          {status === "ready" && group && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full bg-card-bg/40 backdrop-blur-3xl p-8 md:p-10 rounded-[40px] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col items-center text-center relative"
            >
              {/* Group Mini Banner */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-[32px] overflow-hidden border-4 border-card-bg shadow-2xl z-20">
                {group.bannerUrl ? (
                  <img src={group.bannerUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center text-white text-3xl font-bold">
                    {group.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mt-12 w-full flex flex-col items-center">
                <span className="text-[10px] font-black text-pink-500 uppercase tracking-[3px] mb-2 bg-pink-500/10 px-4 py-1.5 rounded-full">
                  {t("invitation") || "Lời mời tham gia"}
                </span>
                <h2 className="text-3xl font-black text-text-primary mb-3 tracking-tight">
                  {group.name}
                </h2>
                <p className="text-sm text-text-muted mb-8 font-medium max-w-[260px] leading-relaxed">
                  {t("join_group_subtitle") || "Bạn vừa được gửi một vé tham gia không gian tuyệt vời này."}
                </p>

                <div className="w-full space-y-6 mb-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-text-muted text-center opacity-60">
                      {t("invite_code_label") || "Nhập Mã Mời"}
                    </label>
                    <div className="relative group">
                      <Input
                        value={inviteCodeInput}
                        onChange={e => setInviteCodeInput(e.target.value.slice(0, 6))}
                        placeholder="••••••"
                        className="h-16 text-center font-black tracking-[12px] text-2xl uppercase bg-white/5 border-white/10 rounded-2xl focus:bg-white/10 focus:border-pink-500/50 transition-all placeholder:tracking-normal placeholder:opacity-20"
                        autoFocus
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    {joinError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[12px] font-bold text-red-500 text-center"
                      >
                        ⚠ {joinError}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <Button
                    className="w-full h-14 rounded-2xl font-black tracking-widest uppercase text-xs active:scale-95 transition-all shadow-none"
                    onClick={handleJoin}
                    disabled={inviteCodeInput.length !== 6}
                    style={{ background: group.themeColor || '#ec4899' }}
                  >
                    {t("join_now")} ✦
                  </Button>
                  <button 
                    onClick={() => navigate("/")}
                    className="text-[11px] font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors py-2"
                  >
                    {t("maybe_later") || "Để lúc khác"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {status === "joining" && (
            <motion.div
              key="joining"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-pink-500/10 border-t-pink-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xl">🚀</div>
              </div>
              <p className="text-text-primary font-black tracking-widest uppercase text-xs animate-pulse">
                {t("processing")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Blur Background */}
      <div className="fixed inset-0 z-[-1] bg-bg-primary" />
    </div>
  );
}
