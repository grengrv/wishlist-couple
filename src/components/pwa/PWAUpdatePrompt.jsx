import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PWAUpdatePrompt() {
    const { needRefresh, updateServiceWorker } = useRegisterSW()

    if (!needRefresh) return null

    return (
        <div className="fixed bottom-5 right-5 z-[9999] bg-black/80 backdrop-blur-xl text-white px-4 py-3 rounded-2xl flex items-center gap-3">
            <span>App có bản mới</span>
            <button
                onClick={() => updateServiceWorker(true)}
                className="text-pink-400"
            >
                Cập nhật
            </button>
        </div>
    )
}
