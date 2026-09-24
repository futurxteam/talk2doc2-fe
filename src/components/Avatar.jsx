// src/components/Avatar.jsx
import React, { useEffect, useRef, useState } from "react";
import "./style/avatar.css";

export default function Avatar({ onSelect }) {
    const mapPart = (name) => {
        const map = {
            head: "head", neck: "head", chest: "chest", abdomen: "abdomen",
            left_shoulder: "muscles", right_shoulder: "muscles",
            left_arm: "muscles", right_arm: "muscles",
            left_forearm: "muscles", right_forearm: "muscles",
            left_hand: "joints", right_hand: "joints",
            left_thigh: "joints", right_thigh: "jo ints",
            left_leg: "joints", right_leg: "joints",

            left_foot: "joints", right_foot: "joints",
        };
        return map[name] || name;
    };

    const [selected, setSelected] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const svgUrl = new URL("../assets/body-animation.svg", import.meta.url).href;
        let cancelled = false;
        let overlay;

        async function loadAndAttach() {
            if (!containerRef.current) return;
            // fetch SVG text and insert inline
            const res = await fetch(svgUrl);
            const svgText = await res.text();
            if (cancelled) return;
            containerRef.current.innerHTML = svgText;

            const svg = containerRef.current.querySelector("svg");
            if (!svg) return;

            const zones = [
                { id: "head", d: "M112 27 A48 58 0 1 1 208 27 A48 58 0 1 1 112 27 Z" },
                { id: "neck", d: "M140 135 L180 135 L180 165 L140 165 Z" },
                { id: "chest", d: "M100 165 Q90 175 90 195 L90 290 Q90 315 100 325 L220 325 Q230 315 230 290 L230 195 Q230 175 220 165 Z" },
                { id: "abdomen", d: "M100 325 L220 325 L215 390 L105 390 Z" },
                { id: "left_shoulder", d: "M50 190 A30 36 0 1 1 110 190 A30 36 0 1 1 50 190 Z" },
                { id: "right_shoulder", d: "M210 190 A30 36 0 1 1 270 190 A30 36 0 1 1 210 190 Z" },
                { id: "left_arm", d: "M70 215 Q60 240 65 270 Q70 300 80 325 L95 320 Q90 295 88 265 Q85 235 80 215 Z" },
                { id: "right_arm", d: "M250 215 Q260 240 255 270 Q250 300 240 325 L225 320 Q230 295 232 265 Q235 235 240 215 Z" },
                { id: "left_forearm", d: "M80 325 Q75 355 78 385 Q82 410 90 430 L100 427 Q95 405 93 380 Q90 350 88 325 Z" },
                { id: "right_forearm", d: "M240 325 Q245 355 242 385 Q238 410 230 430 L220 427 Q225 405 227 380 Q230 350 232 325 Z" },
                { id: "left_hand", d: "M73 440 A22 28 0 1 1 117 440 A22 28 0 1 1 73 440 Z" },
                { id: "right_hand", d: "M203 440 A22 28 0 1 1 247 440 A22 28 0 1 1 203 440 Z" },
                { id: "left_thigh", d: "M110 390 Q100 410 100 440 Q100 480 115 510 L140 510 Q130 480 128 440 Q125 410 120 390 Z" },
                { id: "right_thigh", d: "M210 390 Q220 410 220 440 Q220 480 205 510 L180 510 Q190 480 192 440 Q195 410 200 390 Z" },
                { id: "left_leg", d: "M115 510 Q110 530 112 560 Q115 590 125 615 L135 615 Q130 585 128 555 Q125 525 123 510 Z" },
                { id: "right_leg", d: "M205 510 Q210 530 208 560 Q205 590 195 615 L185 615 Q190 585 192 555 Q195 525 197 510 Z" },
                { id: "left_foot", d: "M102 630 A28 18 0 1 1 158 630 A28 18 0 1 1 102 630 Z" },
                { id: "right_foot", d: "M162 630 A28 18 0 1 1 218 630 A28 18 0 1 1 162 630 Z" },
            ];

            overlay = document.createElementNS("http://www.w3.org/2000/svg", "g");
            overlay.classList.add("click-overlay");

            zones.forEach(zone => {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", zone.d);
                path.setAttribute("fill", "transparent");
                path.setAttribute("pointer-events", "all");
                path.style.cursor = "pointer";
                path.dataset.part = zone.id;

                path.addEventListener("click", () => {
                    setSelected(zone.id);
                    if (typeof onSelect === "function") onSelect(mapPart(zone.id));
                });

                overlay.appendChild(path);
            });

            svg.appendChild(overlay);
        }

        loadAndAttach();

        return () => {
            cancelled = true;
            // cleanup overlay if present
            const svg = containerRef.current?.querySelector("svg");
            if (svg && overlay && svg.contains(overlay)) svg.removeChild(overlay);
        };
    }, [onSelect]);

    return (
        <div className="avatar-wrapper" ref={containerRef} />
    );
}