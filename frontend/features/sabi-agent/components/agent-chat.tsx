"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import type { AgentChatMessage } from "../types";

const quickActions = ["Make it punchier", "Find a stronger hook", "Cut to 45s", "Add a funny moment", "Reorder for suspense", "Start with the controversy"];

export function AgentChat({
  messages,
  isThinking,
  onSend,
  onApply,
}: {
  messages: AgentChatMessage[];
  isThinking: boolean;
  onSend: (text: string) => void;
  onApply: (message: AgentChatMessage) => void;
}) {
  const [text, setText] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const send = (value: string) => {
    if (!value.trim() || isThinking) return;
    onSend(value.trim());
    setText("");
    requestAnimationFrame(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; });
  };

  return (
    <section className="sabi-chat" aria-labelledby="sabi-chat-heading">
      <div className="sabi-chat-heading"><span className="sabi-agent-avatar"><Sparkles size={13} /></span><h3 id="sabi-chat-heading">Ask Sabi Agent</h3><span>Editor’s ear, on call</span></div>
      <div className="sabi-chat-log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions">
        {messages.slice(-5).map((message) => <div key={message.id} className={`sabi-chat-message sabi-chat-${message.role}`}>
          <p>{message.text}</p>
          {message.action && <button type="button" onClick={() => onApply(message)}>Apply suggestion</button>}
        </div>)}
        {isThinking && <div className="sabi-thinking" role="status"><span /><span /><span /> Sabi’s thinking…</div>}
      </div>
      <div className="sabi-quick-actions" aria-label="Quick actions">
        {quickActions.map((action) => <button type="button" key={action} disabled={isThinking} onClick={() => send(action)}>{action}</button>)}
      </div>
      <form className="sabi-chat-input" onSubmit={(event) => { event.preventDefault(); send(text); }}>
        <label className="sr-only" htmlFor="sabi-chat-text">Message Sabi Agent</label>
        <input id="sabi-chat-text" value={text} maxLength={300} onChange={(event) => setText(event.target.value)} placeholder="Tell me what to change…" disabled={isThinking} />
        <button type="submit" aria-label="Send message" disabled={!text.trim() || isThinking}><ArrowUp size={15} /></button>
      </form>
    </section>
  );
}
