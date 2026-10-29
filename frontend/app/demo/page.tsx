import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AudioLines, Captions, HardDrive, LockKeyhole, Search, Waves } from "lucide-react";
import { DemoPlayer } from "@/components/demo-player";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "See SABI in action",
  description: "Watch how SABI turns footage into searchable transcripts and ready-to-edit captions.",
};

const workflow = [
  {
    icon: HardDrive,
    number: "01",
    title: "Bring in a recording",
    description: "Open a video or audio file in your workspace. Your media stays on your computer.",
  },
  {
    icon: Waves,
    number: "02",
    title: "Choose a language",
    description: "Select English, Yoruba, Igbo, Hausa or Nigerian Pidgin to guide transcription.",
  },
  {
    icon: Captions,
    number: "03",
    title: "Review every line",
    description: "Follow timestamped words, listen back to the recording and make your edits.",
  },
  {
    icon: Search,
    number: "04",
    title: "Find and export",
    description: "Search for a moment by meaning, jump straight to it and export captions as SRT.",
  },
];

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="demo-hero">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="container-wide relative pb-12 pt-16 md:pb-16 md:pt-24">
            <div className="mx-auto max-w-[760px] text-center">
              <div className="eyebrow"><span className="eyebrow-dot" /> A QUICK LOOK INSIDE SABI</div>
              <h1 className="display-heading mt-7">From long recordings<br /><span className="text-accent">to the right moment.</span></h1>
              <p className="mx-auto mt-6 max-w-[620px] text-base leading-7 text-muted md:text-lg md:leading-8">
                See how SABI helps you transcribe, search and shape captions for your footage — with language support and a local-first workflow.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-[960px]">
              <DemoPlayer />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
                <span className="inline-flex items-center gap-2"><LockKeyhole size={14} className="text-accent" /> Your media stays local</span>
                <span className="inline-flex items-center gap-2"><AudioLines size={14} className="text-accent" /> Made for Nigerian voices</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad border-y border-line bg-subtle">
          <div className="container-wide">
            <div className="mx-auto max-w-[640px] text-center">
              <div className="section-kicker">A simple, familiar workflow</div>
              <h2 className="section-heading">Your footage, <span className="text-accent">made easier to work with.</span></h2>
              <p className="section-intro">SABI turns a recording into a searchable, editable starting point for your next cut.</p>
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map(({ icon: Icon, number, title, description }) => (
                <article className="step-card" key={number}>
                  <span className="step-number">{number}</span>
                  <div className="step-rule" />
                  <span className="demo-step-icon"><Icon size={18} strokeWidth={1.7} /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container-wide py-16 md:py-24">
          <div className="demo-next-panel">
            <div>
              <div className="section-kicker">Ready to try it yourself?</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">Bring your next recording into focus.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Open the workspace to upload a clip, generate a transcript and find the moments worth keeping.</p>
            </div>
            <Link className="button button-primary shrink-0" href="/workspace">Open the workspace <ArrowRight size={16} /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
