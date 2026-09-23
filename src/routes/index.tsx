import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  MessageCircle,
  FileText,
  ArrowRight,
  Search,
  Bookmark,
  History,
  Shield,
  Sparkles,
  Scale,
  Gavel,
  Building2,
  Users,
  ScrollText,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import previewChat from "@/assets/AI chat-preview.png";
import previewDraftGenerator from "@/assets/draft-generator.png";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JusticeLine AI — AI-Powered Legal Research & Drafting" },
      {
        name: "description",
        content:
          "Search judgments, ask legal questions, and generate professional legal drafts with AI. Built for lawyers, firms, and legal researchers.",
      },
      { property: "og:title", content: "JusticeLine AI — AI-Powered Legal Research & Drafting" },
      {
        property: "og:description",
        content:
          "Search judgments, ask legal questions, and generate professional legal drafts with AI. Built for lawyers, firms, and legal researchers.",
      },
    ],
  }),
  component: Landing,
});
 
const features = [
  { icon: MessageCircle, title: "AI Legal Chat", desc: "Conversational research over statutes, case law, and precedent." },
  { icon: Search, title: "Judgment Search", desc: "Semantic search across Supreme Court, High Court and tribunal rulings." },
  { icon: FileText, title: "Draft Generator", desc: "Guided forms that produce court-ready documents in minutes." },
];
 
const stats = [
  { value: "10,000+", label: "Legal Questions Answered" },
  { value: "5,000+", label: "Legal Drafts Generated" },
  { value: "1,000+", label: "Legal Professionals" },
  { value: "99%", label: "User Satisfaction" },
];
 
const categories = [
  {
    icon: Building2,
    title: "Property Documents",
    items: ["Sale Deed", "Gift Deed", "Lease Agreement"],
  },
  {
    icon: Gavel,
    title: "Court Documents",
    items: ["Affidavit", "Legal Notice", "Petition"],
  },
  {
    icon: Users,
    title: "Business Agreements",
    items: ["Employment Agreement", "Partnership Agreement", "NDA"],
  },
  {
    icon: ScrollText,
    title: "Personal Documents",
    items: ["Will", "Power of Attorney", "Declaration"],
  },
];
 
function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
 
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-gold/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #6A1B1A 1px, transparent 1px), linear-gradient(to bottom, #6A1B1A 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
 
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Trusted by 1,000+ advocates & law firms
            </div>
            <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              AI-Powered Legal Research &{" "}
              <span className="text-gradient-gold italic">Document Drafting</span>{" "}
              Platform
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
              Search judgments, ask legal questions, generate legal drafts, and simplify
              legal workflows using artificial intelligence — purpose-built for the
              modern practice of law.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup">
                <Button size="lg" className="bg-brand-gradient text-white shadow-premium hover:opacity-95">
                  Start free trial <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
           
            </div>
          </motion.div>
 
          {/* Feature showcase */}
          <FeatureShowcase />
        </div>
      </section>
 
{/* Premium Divider */}
<div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-6">
  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/60 to-primary/70" />
 
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-background shadow-sm">
    <Scale className="h-5 w-5 text-gold" />
  </div>
 
  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/60 to-primary/70" />
</div>
      {/* FEATURES GRID */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Platform
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Everything your practice needs, in one workspace
          </h2>
          <p className="mt-4 text-muted-foreground">
            From first research to final draft — JusticeLine AI unifies the tools senior
            counsel actually use.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold/5 blur-2xl transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* CATEGORIES */}
      <section className="border-t border-border bg-secondary/30">
<div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6">          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Draft Library
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                A document for every matter
              </h2>
            </div>
            <Link to="/draft">
              <Button variant="outline">
                Learn More
 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-premium"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-gold shadow-elegant">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{c.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {c.items.map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-gold" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 text-center shadow-premium sm:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(184,134,11,0.4), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.15), transparent 40%)",
            }} />
          <Scale className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mx-auto mt-6 max-w-2xl font-serif text-3xl font-semibold text-white sm:text-4xl">
            Build the future of your practice today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Join 1,000+ legal professionals using JusticeLine AI to research faster and
            draft better.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-gold-gradient text-gold-foreground hover:opacity-95">
                Create free account
              </Button>
            </Link>
         
          </div>
        </div>
      </section>
 
      <PublicFooter />
    </div>
  );
}
 
type ShowcaseSlide = {
  id: "chat" | "draft";
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
  cta: string;
  to: "/login";
  icon: typeof MessageCircle;
  image: string;
};
 
const SLIDES: ShowcaseSlide[] = [
  {
    id: "chat",
    eyebrow: "Research",
    title: "AI Legal Chat",
    description:
      "Ask questions on Acts, Sections, Judgments and Case Law. Get AI-powered legal answers backed by trusted citations.",
    cta: "Start AI Chat",
    to: "/login",
    icon: MessageCircle,
    image: previewChat,
  },
  {
    id: "draft",
    eyebrow: "Drafting",
    title: "Legal Draft Generator",
    description:
      "Generate professional legal drafts including Sale Deeds, Agreements, Affidavits, Notices, Wills, Petitions, Power of Attorney and more.",
    cta: "Create Draft",
    to: "/login",
    icon: FileText,
    image: previewDraftGenerator,
  },
];
 
function FeatureShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
 
  // Preload both images once
  useEffect(() => {
    SLIDES.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);
 
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 10000);
    return () => window.clearInterval(id);
  }, [paused]);
 
  const slide = SLIDES[index];
  const Icon = slide.icon;
 
  return (
    <div
      className="relative mx-auto mt-16 max-w-6xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient animated glow */}
      <div className="pointer-events-none absolute -inset-8 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 20, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
        />
      </div>
 
<div className="grid min-w-0 items-center gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-14">        {/* LEFT — content card */}
<div className="min-w-0 w-full max-w-[380px]">
 
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
className="flex h-full flex-col justify-center px-1 py-1"              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                  {slide.eyebrow}
                </div>
                <h3 className="mt-2 font-serif text-4xl leading-[1.08] font-semibold tracking-[-0.02em] text-foreground sm:text-[46px] lg:text-[54px]">
                  {slide.title}
                </h3>
                <p className="mt-4 w-full max-w-[360px] text-[15px] leading-7 text-muted-foreground sm:leading-8">
                  {slide.description}
                </p>
                <div className="mt-6">
                  <Link to={slide.to}>
                    <Button
                      className="group h-12 rounded-full px-7 bg-brand-gradient text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                      {slide.cta} <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
     
        </div>
 
        {/* RIGHT — preview card */}
        <div className="min-w-0 w-full pt-2 lg:pt-10">
       <motion.div
  animate={{ y: [-4, 0, -4] }}
  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
className="group relative aspect-[16/10] w-full max-w-[610px] overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_40px_100px_rgba(0,0,0,0.18)] transition-shadow duration-300 hover:shadow-[0_30px_80px_rgba(0,0,0,0.22)] sm:rounded-[28px] lg:h-[430px] lg:aspect-auto lg:rounded-[32px]">
 
 
  {/* Screenshot */}
 
<div className="relative h-full w-full min-w-0 overflow-hidden rounded-[24px] sm:rounded-[28px] lg:rounded-[32px]">
      <AnimatePresence mode="wait">
 
          <motion.img
              key={slide.id}
  src={slide.image}
  alt={`${slide.title} preview`}
  width={1280}
  height={800}
  loading="lazy"
  initial={{ opacity: 0, scale: 0.98 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.98 }}
  transition={{ duration: 0.7, ease: "easeInOut" }}
className="absolute inset-0 h-full w-full object-contain object-top transition-transform duration-300 group-hover:scale-[1.02]"          />
 
      </AnimatePresence>
 
  </div>
 
</motion.div>
</div>
             
      </div>
 
      {/* Pagination dots */}
        <div className="mt-4 flex items-center justify-center gap-2 sm:mt-6">        {SLIDES.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              type="button"
              aria-label={`Show ${s.title}`}
              onClick={() => setIndex(i)}
              className="group relative h-2 overflow-hidden rounded-full bg-border transition-all"
              style={{ width: active ? 28 : 8 }}
            >
              <motion.span
                initial={false}
                animate={{ opacity: active ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-full bg-brand-gradient"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
 
 