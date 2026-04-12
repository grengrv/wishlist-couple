import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useGroups } from "../hooks/useGroups";
import Button from "../components/ui/Button";

export default function InvitePage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { thamGiaNhom } = useGroups(user);
  const [group, setGroup] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchGroup() {
      const snap = await getDoc(doc(db, "groups", id));
      if (snap.exists()) {
        const gData = snap.data();
        setGroup(gData);
        // Kiểm tra xem đã là thành viên chưa
        if (gData.members?.includes(user?.uid)) {
           navigate(`/groups/${id}`);
        } else {
           setStatus("ready");
        }
      } else {
        setStatus("not_found");
      }
    }
    if (user) fetchGroup();
  }, [id, user, navigate]);

  async function handleJoin() {
    setStatus("joining");
    await thamGiaNhom(id);
    navigate(`/groups/${id}`);
  }

  return (
    <div className="py-20 flex flex-col items-center max-w-[400px] mx-auto text-center px-5">
      {status === "loading" && <p className="text-pink-brand animate-pulse">Đang định vị lời mời...</p>}
      {status === "not_found" && <p className="text-[15px] text-pink-brand font-medium">Nhóm không tồn tại hoặc đã bị giải tán mất rồi.</p>}
      
      {status === "ready" && group && (
        <div className="bg-white p-8 rounded-[20px] border border-pink-border w-full flex flex-col items-center shadow-lg animate-slide-up">
           <div className="w-16 h-16 rounded-full bg-pink-faint flex items-center justify-center text-pink-brand text-2xl mb-4">✨</div>
           <h2 className="text-xl font-bold text-deep-red mb-2">Lời mời tham dự</h2>
           <p className="text-sm text-text-sub mb-4">Bạn vừa được gửi một vé tham gia không gian:</p>
           <h3 className="text-xl font-semibold text-text-base mb-8 italic">"{group.name}"</h3>
           
           <div className="flex gap-3 w-full">
             <Button variant="ghost" className="flex-1" onClick={() => navigate("/")}>Từ chối</Button>
             <Button className="flex-1" onClick={handleJoin}>Tham gia ngay</Button>
           </div>
        </div>
      )}
      
      {status === "joining" && <p className="text-pink-brand animate-pulse">Đang chuẩn bị chỗ ngồi, đợi xíu nha...</p>}
    </div>
  );
}
