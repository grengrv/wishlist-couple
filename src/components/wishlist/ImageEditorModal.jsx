import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@utils/cropImage";
import { useConfirm } from "@context/ConfirmContext";
import { notifyCompressing } from "@utils/notify";

export default function ImageEditorModal({ isOpen, imageSrc, file, isBanner, isGif, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const confirm = useConfirm();

  const aspect = isBanner ? 16 / 9 : 1 / 1;

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleRequestClose = useCallback(async () => {
    if (isProcessing) return;

    if (imageSrc) {
      const ok = await confirm({
        title: "Hủy chỉnh sửa?",
        message: "Bạn có chắc muốn thoát? Các thay đổi trên ảnh này sẽ không được lưu.",
        confirmText: "Thoát",
        cancelText: "Ở lại",
        variant: "danger"
      });
      if (!ok) return;
    }
    onClose();
  }, [isProcessing, imageSrc, confirm, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleRequestClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRequestClose]);

  const handleSave = async () => {
    if (isGif) {
      try {
        setIsProcessing(true);
        // Convert blob URL back to Base64 for Firestore storage without losing animation
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          onSave(reader.result, file);
          setIsProcessing(false);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("GIF conversion error:", err);
        setIsProcessing(false);
      }
      return;
    }

    try {
      setIsProcessing(true);
      if (!isGif) notifyCompressing();
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onSave(croppedImage, null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => !isProcessing && handleRequestClose()}>
      <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-800">
            {isGif ? "Xem trước ảnh động" : "Chỉnh sửa hình ảnh"}
          </h3>
          <button onClick={handleRequestClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="relative w-full h-[50vh] bg-gray-100 flex items-center justify-center overflow-hidden">
          {isGif ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-4">
              <img
                src={imageSrc}
                alt="preview"
                className={`object-contain max-h-[80%] rounded-xl shadow-md ${isBanner ? "aspect-video" : "aspect-square"}`}
              />
              <p className="text-sm font-bold text-pink-500 bg-pink-50 px-4 py-2 rounded-full text-center">
                ✨ Ảnh động GIF sẽ được giữ nguyên hiệu ứng để tối ưu trải nghiệm.
              </p>
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              cropShape={isBanner ? "rect" : "round"}
              showGrid={false}
              style={{
                containerStyle: { background: '#f3f4f6' },
                cropAreaStyle: { border: '3px solid white', boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.5)' }
              }}
            />
          )}
        </div>

        {/* Controls */}
        {!isGif && (
          <div className="p-6 bg-white flex flex-col gap-5 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-500 w-16">Thu phóng</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-pink-500 h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-500 w-16">Xoay ảnh</span>
              <div className="flex flex-1 gap-3">
                <button
                  onClick={() => setRotation(r => r - 90)}
                  className="flex-1 py-2 bg-gray-50 hover:bg-pink-50 hover:text-pink-600 text-gray-600 font-bold text-sm rounded-xl transition-colors border border-gray-100 flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                  Trái
                </button>
                <button
                  onClick={() => setRotation(r => r + 90)}
                  className="flex-1 py-2 bg-gray-50 hover:bg-pink-50 hover:text-pink-600 text-gray-600 font-bold text-sm rounded-xl transition-colors border border-gray-100 flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                  Phải
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={handleRequestClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-8 py-2.5 text-sm font-black text-white bg-gray-900 rounded-xl shadow-lg shadow-gray-900/20 hover:bg-pink-500 hover:shadow-pink-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? "Đang xử lý..." : "Áp dụng & Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
