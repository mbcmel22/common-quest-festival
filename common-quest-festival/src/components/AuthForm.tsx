"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { passwordIssues, isValidEmail } from "@/lib/format";
import type { Locale, Dictionary } from "@/i18n";

type Mode = "login" | "signup";

const eyeLabels: Record<string, { show: string; hide: string }> = {
  fr: { show: "Afficher le mot de passe", hide: "Masquer le mot de passe" },
  en: { show: "Show password", hide: "Hide password" },
  es: { show: "Mostrar la contrasena", hide: "Ocultar la contrasena" }
};

function EyeButton({ shown, onToggle, locale }: { shown: boolean; onToggle: () => void; locale: Locale }) {
  const label = shown ? eyeLabels[locale].hide : eyeLabels[locale].show;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      aria-pressed={shown}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-smoke transition-colors hover:text-acid"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {shown ? (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.4 5.2A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9 7 0 .9-.7 2.2-1.9 3.4" />
            <path d="M6.2 6.7C4 8.2 3 10.2 3 12c0 2.5 4 7 9 7 1.4 0 2.6-.3 3.7-.8" />
          </>
        ) : (
          <>
            <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z" />
            <circle cx="12" cy="12" r="2.6" />
          </>
        )}
      </svg>
    </button>
  );
}

export default function AuthForm({ mode, locale, dict }: { mode: Mode; locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const issues = passwordIssues(password);
  const strength = 4 - issues.length;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!isValidEmail(email)) return setError(dict.auth.errorEmail);

    const supabase = createClient();
    setBusy(true);

    if (mode === "signup") {
      if (issues.length > 0) {
        setBusy(false);
        return setError(dict.auth.errorPasswordWeak);
      }
      if (password !== confirm) {
        setBusy(false);
        return setError(dict.auth.errorPasswordMatch);
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Le mot de passe part chiffre en TLS vers Supabase, qui le hashe en bcrypt.
          // Il n est jamais stocke dans notre base ni lisible par l’équipe.
          data: { full_name: fullName, locale, newsletter_opt_in: newsletter },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/compte`
        }
      });
      setBusy(false);
      if (signUpError) return setError(dict.auth.errorGeneric);
      return setNotice(dict.auth.checkEmail);
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) return setError(dict.auth.errorGeneric);
    const next = searchParams.get("suite") ?? `/${locale}/compte`;
    router.push(next);
    router.refresh();
  }

  async function resetPassword() {
    if (!isValidEmail(email)) return setError(dict.auth.errorEmail);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/compte`
    });
    setNotice(dict.auth.resetSent);
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5" noValidate>
      {mode === "signup" && (
        <div>
          <label className="label" htmlFor="fullName">
            {dict.auth.fullName}
          </label>
          <input
            id="fullName"
            className="field"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            maxLength={80}
          />
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">
          {dict.auth.email}
        </label>
        <input
          id="email"
          type="email"
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          maxLength={120}
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          {dict.auth.password}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="field pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={mode === "signup" ? 12 : undefined}
            aria-describedby="password-hint"
          />
          <EyeButton shown={showPassword} onToggle={() => setShowPassword((v) => !v)} locale={locale} />
        </div>
        {mode === "signup" && (
          <>
            <div className="mt-2 flex gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? "bg-acid" : "bg-white/15"}`} />
              ))}
            </div>
            <p id="password-hint" className="mt-2 text-xs text-smoke">
              {dict.auth.passwordHint}
            </p>
          </>
        )}
      </div>

      {mode === "signup" && (
        <>
          <div>
            <label className="label" htmlFor="confirm">
              {dict.auth.passwordConfirm}
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                className="field pr-12"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
              <EyeButton shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} locale={locale} />
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm text-paper/80">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#E7FF36]"
            />
            {dict.auth.newsletter}
          </label>
          <p className="text-xs text-smoke">{dict.auth.rgpd}</p>
        </>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl border border-acid/40 bg-acid/10 px-4 py-3 text-sm text-acid">
          {notice}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-acid w-full disabled:opacity-50">
        {busy ? dict.common.loading : mode === "signup" ? dict.auth.submitSignup : dict.auth.submitLogin}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm">
        {mode === "login" ? (
          <>
            <Link href={`/${locale}/inscription`} className="text-smoke hover:text-acid">
              {dict.auth.noAccount} {dict.nav.inscription}
            </Link>
            <button type="button" onClick={resetPassword} className="text-smoke hover:text-acid">
              {dict.auth.forgot}
            </button>
          </>
        ) : (
          <Link href={`/${locale}/connexion`} className="text-smoke hover:text-acid">
            {dict.auth.hasAccount} {dict.nav.connexion}
          </Link>
        )}
      </div>
    </form>
  );
}
