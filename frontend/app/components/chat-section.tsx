"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, AlertCircle, RefreshCw } from "lucide-react";
import SectionWrapper from "./section-wrapper";
import { CHAT_CONFIG, EMPTY_STRING } from "@/app/data/portfolio-data";

const SECTION_ID = "ask-ai";
const DATA_PREFIX = "data: ";
const NEWLINE_SPLIT = "\n";

interface StreamTokenPayload {
  token?: string;
  done?: boolean;
  error?: string;
}

export default function ChatSection() {
  const [question, setQuestion] = useState(EMPTY_STRING);
  const [activeQuestion, setActiveQuestion] = useState(EMPTY_STRING);
  const [responseContent, setResponseContent] = useState(EMPTY_STRING);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(EMPTY_STRING);

  const responseContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure response starts scrolled to top so user reads from the beginning
  useEffect(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop = 0;
    }
  }, [activeQuestion]);

  const handleSendQuestion = useCallback(async (queryToSend: string) => {
    const trimmedQuery = queryToSend.trim();
    if (!trimmedQuery || isStreaming) return;

    setActiveQuestion(trimmedQuery);
    setQuestion(EMPTY_STRING);
    setResponseContent(EMPTY_STRING);
    setHasError(false);
    setErrorMessage(EMPTY_STRING);
    setIsStreaming(true);

    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop = 0;
    }

    try {
      const response = await fetch(CHAT_CONFIG.streamEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmedQuery }),
      });

      if (!response.ok) {
        throw new Error(CHAT_CONFIG.statusError);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error(CHAT_CONFIG.statusError);
      }

      const decoder = new TextDecoder();
      let accumulated = EMPTY_STRING;
      let buffer = EMPTY_STRING;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(NEWLINE_SPLIT);
        buffer = lines.pop() || EMPTY_STRING;

        for (const line of lines) {
          if (line.startsWith(DATA_PREFIX)) {
            try {
              const rawJson = line.slice(DATA_PREFIX.length);
              const payload: StreamTokenPayload = JSON.parse(rawJson);

              if (payload.token) {
                accumulated += payload.token;
                setResponseContent(accumulated);
              }
              if (payload.done) {
                setIsStreaming(false);
              }
              if (payload.error) {
                setHasError(true);
                setErrorMessage(payload.error);
                setIsStreaming(false);
              }
            } catch {
              // Ignore partial or non-json keepalive lines
            }
          }
        }
      }
    } catch {
      setHasError(true);
      setErrorMessage(CHAT_CONFIG.statusError);
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSendQuestion(question);
  };

  const handleSuggestionClick = (suggestion: string) => {
    void handleSendQuestion(suggestion);
  };

  return (
    <SectionWrapper id={SECTION_ID} className="py-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header with AI model badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--accent-start)]/10 text-[var(--accent-start)] border border-[var(--accent-start)]/25">
            <Sparkles size={13} />
            {CHAT_CONFIG.badge}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
          {CHAT_CONFIG.title}
        </h2>
        <div className="section-divider mb-8 max-w-xs mx-auto" />

        {/* Question input bar */}
        <form
          onSubmit={handleSubmit}
          className="relative max-w-2xl mx-auto mb-5"
        >
          <div className="flex items-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-start)] focus-within:ring-2 focus-within:ring-[var(--accent-start)]/20 transition-all duration-200 overflow-hidden shadow-lg shadow-black/20">
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={CHAT_CONFIG.placeholder}
              disabled={isStreaming}
              className="w-full bg-transparent px-5 py-4 text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={isStreaming || !question.trim()}
              aria-label={CHAT_CONFIG.sendButtonAria}
              className="p-3.5 mr-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--accent-start)]/20 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              {isStreaming ? (
                <RefreshCw size={18} className="animate-spin text-[var(--accent-start)]" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </form>

        {/* Suggestion prompt chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto mb-8">
          {CHAT_CONFIG.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isStreaming}
              className="px-3.5 py-2 rounded-lg text-xs font-mono text-[var(--text-secondary)] border border-[var(--border-subtle)] bg-[var(--bg-card)]/60 hover:text-[var(--text-primary)] hover:border-[var(--accent-start)]/40 hover:bg-[var(--bg-card)] transition-all duration-200 cursor-pointer disabled:opacity-50 text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Active conversation / response view */}
        <AnimatePresence mode="wait">
          {activeQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto text-left"
            >
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] shadow-xl shadow-black/30 overflow-hidden">
                {/* User question pill */}
                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="w-7 h-7 rounded-full bg-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                    <User size={15} className="text-[var(--text-secondary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-0.5">
                      Question
                    </p>
                    <p className="text-sm sm:text-base font-medium text-[var(--text-primary)] break-words">
                      {activeQuestion}
                    </p>
                  </div>
                </div>

                {/* Assistant response */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--accent-start)]/20 border border-[var(--accent-start)]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={15} className="text-[var(--accent-start)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-start)] mb-1">
                      Karthik S
                    </p>

                    {/* Thinking indicator */}
                    {isStreaming && !responseContent && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] py-1">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-start)] animate-ping" />
                        <span>{CHAT_CONFIG.statusThinking}</span>
                      </div>
                    )}

                    {/* Error display */}
                    {hasError && (
                      <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                        <AlertCircle size={16} className="shrink-0" />
                        <span className="break-words">{errorMessage}</span>
                      </div>
                    )}

                    {/* Streaming content (non-overflowing) */}
                    {responseContent && (
                      <div
                        ref={responseContainerRef}
                        className="max-h-96 overflow-y-auto pr-2 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap break-words"
                      >
                        {responseContent}
                        {isStreaming && (
                          <span className="inline-block w-1.5 h-4 ml-1 translate-y-0.5 bg-[var(--accent-start)] animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}
