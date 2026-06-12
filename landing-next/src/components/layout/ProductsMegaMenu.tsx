"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { LayoutTemplate, Globe } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductsMegaMenuProps {
  isOpen: boolean;
}

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 25,
      mass: 0.8,
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.97,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 25,
      mass: 0.8,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.15,
    },
  },
};

export const ProductsMegaMenu: React.FC<ProductsMegaMenuProps> = ({
  isOpen,
}) => {
  const { t, lang } = useLanguage();
  const isRtl = lang === "ar";
  const hub = t.productsHub;

  if (!hub) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute top-[80px] left-0 w-full flex justify-center pt-2 px-6 z-[100] cursor-default pointer-events-none">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-[900px] pointer-events-auto bg-white/85 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-white/5 overflow-hidden origin-top"
          >
            <div
              className={`p-10 ${isRtl ? "text-right" : "text-left"}`}
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Core Architecture */}
              <div className="flex flex-col gap-8">
                <motion.h3
                  variants={childVariants}
                  className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold px-2"
                >
                  {hub.megaMenu.primaryTitle}
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <motion.div variants={childVariants}>
                    <MenuLink
                      title={hub.themes.title}
                      subtitle={hub.themes.subtitle}
                      link={hub.themes.link}
                      icon={<LayoutTemplate className="w-8 h-8" />}
                      gradient="from-blue-50 to-blue-100"
                      border="border-blue-200/50"
                      color="text-blue-600"
                    />
                  </motion.div>
                  <motion.div variants={childVariants}>
                    <MenuLink
                      title={hub.domains.title}
                      subtitle={hub.domains.subtitle}
                      link={hub.domains.link}
                      icon={<Globe className="w-8 h-8" />}
                      gradient="from-emerald-50 to-emerald-100"
                      border="border-emerald-200/50"
                      color="text-emerald-600"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface MenuLinkProps {
  title: string;
  subtitle: string;
  link: string;
  icon: React.ReactNode;
  gradient: string;
  border: string;
  color: string;
}

const MenuLink: React.FC<MenuLinkProps> = ({
  title,
  subtitle,
  link,
  icon,
  gradient,
  border,
  color,
}) => {
  return (
    <Link
      href={link}
      className="block group hover:bg-slate-50/50 p-6 -m-6 rounded-3xl transition-colors duration-300 outline-none"
    >
      <div className="flex items-start gap-6">
        <div
          className={cn(
            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-sm border bg-gradient-to-br group-hover:scale-110 transition-transform duration-500 shrink-0",
            gradient,
            border,
            color,
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-2xl font-black text-[#050505] mb-2 tracking-tight group-hover:text-blue-700 transition-colors">
            {title}
          </h4>
          <p className="text-sm font-medium text-slate-500 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity line-clamp-2">
            {subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
};
