"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [typingPhase, setTypingPhase] = useState("typing");
  const fullText = "with Intelligence";
  const TYPING_DELAY = 65;
  const PAUSE_DELAY = 1200;
  const DELETING_DELAY = 55;

  useEffect(() => {
    let timeout;
    if (typingPhase === "typing") {
      if (typed.length < fullText.length) {
        timeout = setTimeout(() => {
          setTyped(fullText.slice(0, typed.length + 1));
        }, TYPING_DELAY);
      } else {
        setTypingPhase("pausing");
      }
    } else if (typingPhase === "pausing") {
      timeout = setTimeout(() => {
        setTypingPhase("deleting");
      }, PAUSE_DELAY);
    } else if (typingPhase === "deleting") {
      if (typed.length > 0) {
        timeout = setTimeout(() => {
          setTyped(fullText.slice(0, typed.length - 1));
        }, DELETING_DELAY);
      } else {
        setTypingPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [typed, typingPhase]);

 const imageRef = useRef(null);
const [imageInView, setImageInView] = useState(false);

useEffect(() => {
  const observer = new window.IntersectionObserver(
    ([entry]) => setImageInView(entry.isIntersecting),
    { threshold: 0.2 }
  );

  if (imageRef.current) observer.observe(imageRef.current);
  return () => observer.disconnect();
}, []);


  return (
    <>
      <section className="relative w-full h-screen bg-white dark:bg-gradient-to-br dark:from-[#18122B] dark:via-[#23235b] dark:to-[#3a3ad6] transition-colors duration-500 px-4 md:px-12 py-24 overflow-hidden">
        
        {/* Background hero image with light-mode gradient and padding */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="w-full h-full relative rounded-xl overflow-hidden
                       bg-gradient-to-br from-[#f0f4ff] via-[#e9f0ff] to-[#dbe6ff]
                       dark:bg-transparent"
          >
            <Image
              src="/heroimage.png"
              alt="abstract gradient image"
              fill
              className="object-cover w-full h-full opacity-90"
              priority
            />
          </div>
        </div>

        <div className="w-full max-w-7xl pl-8 md:pl-24 py-24 md:py-32 relative z-10 flex flex-col justify-center items-start gap-6 h-full">
          <h1 className="text-4xl md:text-6xl font-extrabold font-space leading-tight tracking-tight text-white animate-fadeinup">
            <span className="block">Future-Ready,</span>
            <TypewriterHeading />
          </h1>

          <p
            className="text-base md:text-lg font-space text-[#e0e0f0] leading-relaxed max-w-2xl animate-fadeinup"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
           <i>Redefining personal finance</i> — track, assess, and enhance your spending experience with ZeroSphere.
          </p>

          <div
            className="mt-4 animate-fadeinup"
            style={{ animationDelay: "0.5s", animationFillMode: "both" }}
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="relative font-bold font-space px-6 py-3 rounded-full border border-black dark:border-white bg-white text-black shadow-md text-base flex items-center gap-2 transition-all duration-300 overflow-hidden
                           hover:bg-black hover:text-white hover:shadow-xl
                           dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white
                           focus:outline-none focus:ring-2 focus:ring-black/30 focus:ring-offset-2"
                style={{ minWidth: "140px" }}
                onClick={() => setStarted((prev) => !prev)}
              >
                <span className="relative z-10">{started ? "Let's Go!" : "Get Started"}</span>
                <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-black/60 via-white/0 to-white/60" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

function TypewriterHeading() {
  const phrase = "with Intelligence";
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState("typing");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timeout;
    if (phase === "typing") {
      if (index < phrase.length) {
        timeout = setTimeout(() => {
          setDisplayed(phrase.slice(0, index + 1));
          setIndex(index + 1);
        }, 90);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), 1000);
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), 400);
    } else if (phase === "deleting") {
      if (index > 0) {
        timeout = setTimeout(() => {
          setDisplayed(phrase.slice(0, index - 1));
          setIndex(index - 1);
        }, 60);
      } else {
        timeout = setTimeout(() => setPhase("typing"), 400);
      }
    }
    return () => clearTimeout(timeout);
  }, [phase, index, phrase]);

  useEffect(() => {
    if (phase === "typing") setIndex(0);
    if (phase === "deleting") setIndex(phrase.length);
  }, [phase, phrase.length]);

  return (
    <div className="min-h-[2em] md:min-h-[2.3em]" style={{ lineHeight: 1.35 }}>
      <span
        className="block bg-gradient-to-r from-white via-[#a084ca] to-white bg-clip-text text-transparent font-space text-5xl md:text-7xl font-bold mt-2 home-hero-typed"
        style={{ WebkitTextStroke: "0.5px #23235b" }}
      >
        {displayed}
      </span>
    </div>
  );
}

export default HeroSection;
