"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalFooter } from "@/components/sections/GlobalFooter";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { DASHBOARD_REGISTER } from "@/lib/config";

export default function QuantusPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === "ar";
  const data = t.productsHub?.quantusAI;

  return (
    <div className="min-h-screen bg-white text-[#050505] flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-40 pb-24 text-start">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#000080] transition-colors mb-12 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {isRtl ? "العودة إلى الرئيسية" : "Back to Home"}
        </Link>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-black mb-6">
          {data?.title || "Matgarco Quantus AI"}
        </h1>
        <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mb-16">
          {data?.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {data?.features?.map((feature: any, idx: number) => (
            <div
              key={idx}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-[#000080]/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#000080]/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-[#000080]" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{feature.name}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href={DASHBOARD_REGISTER}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#000080] text-white font-bold rounded-full hover:bg-blue-900 transition-all shadow-lg"
          >
            {isRtl ? "ابدأ تجربة Quantus الآن" : "Try Quantus AI Now"}
          </a>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}
