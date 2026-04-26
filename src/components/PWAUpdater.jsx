import { useEffect, useState, useRef } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PWAUpdater() {
    const { needRefresh, updateServiceWorker } = useRegisterSW()

    const [showToast, setShowToast] = useState(false)
    const [visible, setVisible] = useState(false)

    const hasUpdated = useRef(false) // 🔥 chặn loop

    useEffect(() => {
        if (needRefresh && !hasUpdated.current) {
            hasUpdated.current = true

            // 🚀 update 1 lần duy nhất
            updateServiceWorker(true)

            // 👉 show toast
            setShowToast(true)
            setVisible(true)

            setTimeout(() => setVisible(false), 4500)
            setTimeout(() => setShowToast(false), 5000)
        }
    }, [needRefresh])

    if (!showToast) return null

    return (
        <div className="fixed bottom-5 right-5 z-[9999]">
            <div
                className={`bg-black/80 text-white px-4 py-3 rounded-2xl shadow-lg
        transition-all duration-500
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            >
                ✨ Đã cập nhật bản mới
            </div>
        </div>
    )
}