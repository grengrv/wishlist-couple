import { useLanguage } from "@context/LanguageContext";
import { useEffect } from "react";

export default function TermsPage() {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 md:py-20 animate-fade-in relative z-10 w-full flex-1 flex flex-col">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[300px] h-[300px] bg-pink-400/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[200px] h-[200px] bg-rose-400/10 blur-[80px] rounded-full -z-10 pointer-events-none" />

      <div className="bg-card-bg border border-border-primary rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(236,72,153,0.05)]">
        
        {/* Header Section */}
        <div className="mb-12 border-b border-border-primary/50 pb-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50/80 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 rounded-full text-pink-500 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            {t("legal")}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight mb-4">
            {t("terms_title")}
          </h1>
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest">
            {t("terms_last_updated")}
          </p>
        </div>

        {/* Content Section */}
        <div className="space-y-10 text-text-secondary leading-relaxed">
          <p className="text-lg font-medium text-text-primary opacity-90">
            {t("terms_intro")}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-pink-500">
              {t("terms_section_1_title")}
            </h2>
            <p className="text-base font-medium opacity-80">
              {t("terms_section_1_desc")}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-pink-500">
              {t("terms_section_2_title")}
            </h2>
            <p className="text-base font-medium opacity-80">
              {t("terms_section_2_desc")}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-pink-500">
              {t("terms_section_3_title")}
            </h2>
            <p className="text-base font-medium opacity-80">
              {t("terms_section_3_desc")}
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
