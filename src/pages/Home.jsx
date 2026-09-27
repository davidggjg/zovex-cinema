import React, { useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import HeroCarousel from "@/components/home/HeroCarousel";
import CategoryRow from "@/components/home/CategoryRow";
import BackgroundFX from "@/components/home/BackgroundFX";
import SupportFab from "@/components/home/SupportFab";

const CATEGORIES = ["מומלצים", "סדרות", "סרטים", "אנימה", "ילדים", "אימה", "קומדיה", "אקשן"];

const globalStyles = `
@keyframes shimmerSlide { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.hide-scroll::-webkit-scrollbar { display: none; }
.hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
`;

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const scrollToCategory = (cat) => {
    document.getElementById(`row-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{
      minHeight: "100vh", direction: "rtl",
      fontFamily: "Arial, sans-serif",
      background: "linear-gradient(160deg, #07030f 0%, #150a26 45%, #1a0a1e 75%, #07030f 100%)",
    }}>
      <style>{globalStyles}</style>
      <BackgroundFX />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SiteHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={CATEGORIES}
          onCategoryClick={scrollToCategory}
        />
        <main style={{ padding: "0 0 120px" }}>
          <HeroCarousel />
          {CATEGORIES.map((cat) => (
            <CategoryRow key={cat} title={cat} />
          ))}
        </main>
      </div>
      <SupportFab />
    </div>
  );
}