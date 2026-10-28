import Link from "next/link";
import { ArrowDown, ArrowRight, AudioLines, Captions, Check, HardDrive, LockKeyhole, Search, Sparkles, Waves } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SectionReveal } from "@/components/section-reveal";

const features = [
  { icon: LockKeyhole, title: "Your footage stays yours", text: "Audio is processed by your local server. Your raw files are never sent to a cloud service." },
  { icon: Waves, title: "Made for Nigerian voices", text: "Work in English, Yoruba, Igbo, Hausa and Nigerian Pidgin—with language selection in your control." },
  { icon: Search, title: "Find the moment, not the minute", text: "Search the transcript in plain language and jump straight to the matching moment in your footage." },
  { icon: Captions, title: "Captions you can shape", text: "Review and edit each line, then export a clean SRT ready for your editing timeline." },
  { icon: HardDrive, title: "Local-first by design", text: "After the model is downloaded, transcribe offline. No subscription and no per-minute fee." },
  { icon: AudioLines, title: "Built for long-form work", text: "Turn interviews, talks and event recordings into a clear, timestamped working transcript." },
];

const steps = [
  ["01", "Bring in your footage", "Choose a video or audio file. It stays on your computer."],
  ["02", "Set the spoken language", "Choose a language to guide transcription and help avoid a bad auto-detection."],
  ["03", "Review the transcript", "Follow timestamps, listen back and edit the words that need your attention."],
  ["04", "Find & export", "Search for a moment by meaning, jump to it, and take your captions out as SRT."],
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero-section">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="container-wide relative grid min-h-[650px] items-center gap-14 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
            <div className="max-w-[660px]">
              <div className="eyebrow"><span className="eyebrow-dot" /> OPEN SOURCE · LOCAL FIRST · BUILT FOR NIGERIA</div>
              <h1 className="display-heading mt-7">Your footage has a lot to say.<br /><span className="text-accent">Find the right moment.</span></h1>
              <p className="mt-6 max-w-[570px] text-lg leading-8 text-muted md:text-xl">
                Search your footage by meaning. Caption it accurately — built for Nigerian voices.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link className="button button-primary" href="/workspace">Open the workspace <ArrowRight size={17} /></Link>
                <a className="button button-quiet" href="#how-it-works">See how it works <ArrowDown size={16} /></a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
                <span className="inline-flex items-center gap-2"><Check className="text-accent" size={15} /> Free & open-weight</span>
                <span className="inline-flex items-center gap-2"><Check className="text-accent" size={15} /> Your files stay local</span>
                <span className="inline-flex items-center gap-2"><Check className="text-accent" size={15} /> Works offline after setup</span>
              </div>
            </div>
            <div className="hero-visual-wrap">
              <div className="hero-visual">
                <div className="visual-topbar">
                  <div className="flex items-center gap-2"><span className="record-dot" /> <span className="text-xs font-medium text-secondary">FIELD NOTES — INTERVIEW 04</span></div>
                  <span className="text-[10px] tracking-wide text-muted">LOCAL PROJECT</span>
                </div>
                <div className="visual-preview">
                  <div className="preview-grid" />
                  <div className="preview-person"><div className="person-head" /><div className="person-body" /></div>
                  <span className="preview-time">00:42:18:09</span>
                  <span className="preview-play"><span /></span>
                  <div className="waveform" aria-hidden="true">{Array.from({ length: 60 }, (_, i) => <i key={i} style={{ height: `${18 + ((i * 13 + 19) % 70)}%` }} />)}</div>
                </div>
                <div className="visual-transcript">
                  <div className="flex items-center justify-between border-b border-line px-5 py-3">
                    <span className="text-xs font-semibold tracking-wide">TRANSCRIPT</span>
                    <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Yoruba · 96 lines</span>
                  </div>
                  <div className="space-y-1 px-3 py-3">
                    <div className="transcript-row"><span>00:41:52</span><p>We started this project with one simple question...</p></div>
                    <div className="transcript-row transcript-row-active"><span>00:42:18</span><p>What does it mean to <b>build something for ourselves?</b></p></div>
                    <div className="transcript-row"><span>00:42:24</span><p>And how can we make sure it reaches everyone?</p></div>
                  </div>
                </div>
                <div className="visual-search">
                  <span className="search-icon-visual"><Search size={14} /></span>
                  <span>the moment they talk about building for ourselves</span>
                  <span className="search-visual-key">↵</span>
                </div>
              </div>
              <div className="visual-badge"><span><Sparkles size={14} /></span><div><b>Meaning, not keywords</b><small>Jump right to the conversation</small></div></div>
            </div>
          </div>
          <div className="container-wide pb-7"><a href="#features" className="text-xs tracking-wide text-muted hover:text-foreground">SCROLL TO EXPLORE <span className="ml-2">↓</span></a></div>
        </section>

        <section className="trust-strip border-y border-line">
          <div className="container-wide flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-secondary">Built for the way you actually work</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-medium uppercase tracking-[0.12em] text-muted"><span>Interviews</span><span>Events</span><span>Talks & podcasts</span><span>Documentaries</span></div>
          </div>
        </section>

        <section id="features" className="section-pad">
          <div className="container-wide">
            <SectionReveal><div className="section-kicker">A calmer way to work with raw footage</div><h2 className="section-heading">Less scrubbing.<br /><span className="text-accent">More making.</span></h2><p className="section-intro">The tedious parts of finding and captioning a moment should not get between you and the edit.</p></SectionReveal>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text }, index) => (
                <SectionReveal delay={index * 0.055} key={title}>
                  <article className="feature-card"><span className="feature-icon"><Icon size={19} strokeWidth={1.7} /></span><h3>{title}</h3><p>{text}</p></article>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section-pad border-y border-line bg-subtle">
          <div className="container-wide">
            <SectionReveal><div className="section-kicker">A simple, familiar workflow</div><h2 className="section-heading">From raw clip to<br /><span className="text-accent">ready-to-edit captions.</span></h2></SectionReveal>
            <div className="mt-14 grid gap-8 md:grid-cols-4">
              {steps.map(([number, title, text], index) => <SectionReveal delay={index * 0.07} key={number}><article className="step-card"><span className="step-number">{number}</span><div className="step-rule" /><h3>{title}</h3><p>{text}</p></article></SectionReveal>)}
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-wide grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <SectionReveal><div className="section-kicker">Your work deserves a tool that gets it</div><h2 className="section-heading">Made with Nigerian editors in mind.</h2><p className="mt-5 max-w-lg leading-7 text-muted">A lot of tools assume a fast connection, a cloud account and speech that sounds like their training data. SABI starts closer to your reality: choose the language, keep the footage on your machine, and review every word before it leaves the workspace.</p><Link className="button button-outline mt-7" href="/workspace">Try the workspace <ArrowRight size={16} /></Link></SectionReveal>
            <SectionReveal delay={0.1}><div className="why-panel">
              <div className="why-line"><span className="why-number">01</span><div><b>Privacy that you can understand</b><p>Your media is sent to your local FastAPI server, not uploaded to SABI or a third-party cloud.</p></div><LockKeyhole size={18} /></div>
              <div className="why-line"><span className="why-number">02</span><div><b>Language is your choice</b><p>English, Yoruba, Igbo, Hausa and Pidgin are one selection away. Force the language when you know it.</p></div><Waves size={18} /></div>
              <div className="why-line"><span className="why-number">03</span><div><b>Open tools, no subscription</b><p>Run it locally with open-weight models. You decide when and where to process your work.</p></div><HardDrive size={18} /></div>
            </div></SectionReveal>
          </div>
        </section>

        <section className="container-wide pb-24">
          <div className="cta-panel">
            <div className="cta-pattern" aria-hidden="true" />
            <div className="relative max-w-[660px]"><div className="section-kicker">Ready when you are</div><h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] md:text-4xl">Make your next edit<br />start with the right moment.</h2><p className="mt-4 max-w-lg leading-7 text-muted">Open your local workspace and bring the rough cut into focus.</p><Link className="button button-primary mt-7" href="/workspace">Open SABI workspace <ArrowRight size={16} /></Link></div>
            <div className="cta-icon"><AudioLines size={35} strokeWidth={1.3} /></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
