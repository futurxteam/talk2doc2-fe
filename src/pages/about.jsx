// src/pages/AboutUs.jsx
import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

import "./style/about.css";
import { useLanguage } from "../context/LanguageContext"; // ✅ import context

// ✅ Exported Carousel component (for reuse)
export function SymptomCarousel() {
  const { language } = useLanguage(); // ✅ get selected language
  const sliderRef = useRef(null);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,    // <-- show 2 cards per view (desktop/tablet)
    slidesToScroll: 1,
    arrows: false,
    
    draggable: true,       // <-- Enable mouse dragging
  swipeToSlide: true,    // <-- Drag freely between slides
  touchMove: true,       // <-- Ensures smooth movement
  swipe: true,           // <-- Allows swipe with mouse & touch
    responsive: [
      {
        breakpoint: 1100, // medium screens: keep 2 but adjust if you want
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768, // mobile: 1 card per view
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const steps =
    language === "ml"
      ? [
          { title: "1. അസ്വസ്ഥത തോന്നുമ്പോൾ Symptom തുറക്കുക", image: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png" },
          { title: "2. നിങ്ങളുടെ അപകട ഘടകങ്ങൾ തിരഞ്ഞെടുക്കുക", image: "https://cdn-icons-png.flaticon.com/512/847/847969.png" },
          { title: "3. പ്രാഥമിക ലക്ഷണങ്ങൾ ചേർക്കുക", image: "https://cdn-icons-png.flaticon.com/512/4139/4139973.png" },
          { title: "4. അനുബന്ധ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക", image: "https://cdn-icons-png.flaticon.com/512/4333/4333609.png" },
          { title: "5. ഏറ്റവും സാധ്യതയുള്ള അവസ്ഥകൾ നേടുക", image: "https://cdn-icons-png.flaticon.com/512/4322/4322998.png" },
          { title: "6. അഭിമുഖം ആരംഭിക്കുക", image: "https://cdn-icons-png.flaticon.com/512/869/869636.png", button: true },
        ]
      : [
          { title: "1. Open Symptom when you start feeling unwell", image: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png" },
          { title: "2. Select your risk factors", image: "https://cdn-icons-png.flaticon.com/512/847/847969.png" },
          { title: "3. Add your initial symptoms", image: "https://cdn-icons-png.flaticon.com/512/4139/4139973.png" },
          { title: "4. Answer some complementary questions", image: "https://cdn-icons-png.flaticon.com/512/4333/4333609.png" },
          { title: "5. Get the most probable conditions", image: "https://cdn-icons-png.flaticon.com/512/4322/4322998.png" },
          { title: "6. Start interview", image: "https://cdn-icons-png.flaticon.com/512/869/869636.png", button: true },
        ];

  return (
    <div className="carousel-section">
      <h2 className="carousel-title">
        {language === "ml" ? "Symptom എങ്ങനെ പ്രവർത്തിക്കുന്നു" : "How Symptom Works"}
      </h2>
      <p className="carousel-subtitle">
        {language === "ml"
          ? "നിങ്ങളുടെ ലക്ഷണങ്ങൾ ഘട്ടം ഘട്ടമായി വിശകലനം ചെയ്യാൻ ഞങ്ങളുടെ ബുദ്ധിമാനായ അസിസ്റ്റന്റ് നിങ്ങളെ സഹായിക്കുന്നു."
          : "Our intelligent assistant helps you analyze your symptoms step-by-step to make confident health decisions."}
      </p>

      <div className="carousel-arrows">
        <button onClick={() => sliderRef.current.slickPrev()} className="arrow-btn">
          &#8592;
        </button>
        <button onClick={() => sliderRef.current.slickNext()} className="arrow-btn">
          &#8594;
        </button>
      </div>

      <div className="carousel-container">
        <Slider ref={sliderRef} {...settings}>
          {steps.map((step, index) => (
            <div key={index} className="carousel-card">
              <img src={step.image} alt={step.title} className="carousel-img" />
              <p className="carousel-text">{step.title}</p>
              {step.button && (
                <button className="carousel-btn">
                  {language === "ml" ? "അഭിമുഖം ആരംഭിക്കുക" : "Start Interview"}
                </button>
              )}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

// ✅ Default export for About page
export default function AboutUs() {
  return (
    <div className="about-page">
      <Header />
      <main className="about-main">
        <SymptomCarousel />
      </main>
      <Footer />
    </div>
  );
}
