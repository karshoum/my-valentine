// File: frontend/src/features/auth/GoogleSignInButton.tsx

import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/features/auth/useAuth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`);
  if (existingScript) {
    return new Promise((resolve) => existingScript.addEventListener("load", () => resolve()));
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

interface GoogleSignInButtonProps {
  onError: (message: string) => void;
  onSuccess: () => void;
}

/**
 * زر "الدخول عبر قوقل"، يظهر فقط عند ضبط VITE_GOOGLE_CLIENT_ID (فارغ
 * افتراضياً حتى تُنشأ بيانات اعتماد فعلية من Google Cloud Console).
 */
export function GoogleSignInButton({ onError, onSuccess }: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    loadGoogleIdentityScript().then(() => setIsScriptReady(true));
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !isScriptReady || !buttonContainerRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          await loginWithGoogle(response.credential);
          onSuccess();
        } catch {
          onError("تعذّر تسجيل الدخول عبر قوقل، حاول مرة أخرى");
        }
      },
    });
    window.google.accounts.id.renderButton(buttonContainerRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
    });
  }, [clientId, isScriptReady, loginWithGoogle, onError, onSuccess]);

  if (!clientId) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        أو
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <div ref={buttonContainerRef} className="flex w-full justify-center" />
    </div>
  );
}
