"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth } from "@/components/providers/AuthProvider";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/[0-9]/, "Include a number"),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });

  const pw = watch("password") ?? "";
  const rules = [
    { ok: pw.length >= 8, label: "8+ characters" },
    { ok: /[A-Za-z]/.test(pw), label: "a letter" },
    { ok: /[0-9]/.test(pw), label: "a number" },
  ];

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setServerError(body.error ?? "Something went wrong. Please try again.");
      return;
    }
    await refresh();
    router.push("/account");
    router.refresh();
  };

  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      "",
      "Google Sign-In",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      alert("Please allow popups to sign in with Google!");
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Sign in - Google Accounts</title>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Roboto', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              color: #202124;
              display: flex;
              flex-direction: column;
              height: 100vh;
            }
            .header {
              padding: 24px 24px 0;
              text-align: center;
            }
            .google-logo {
              height: 24px;
              margin-bottom: 16px;
            }
            .title {
              font-size: 24px;
              font-weight: 400;
              line-height: 1.33;
              margin: 0;
            }
            .subtitle {
              font-size: 16px;
              color: #5f6368;
              margin-top: 8px;
              margin-bottom: 0;
            }
            .content {
              flex: 1;
              padding: 24px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .account-list {
              width: 100%;
              max-width: 360px;
              border: 1px solid #dadce0;
              border-radius: 8px;
              overflow: hidden;
              margin-top: 24px;
            }
            .account-item {
              display: flex;
              align-items: center;
              padding: 12px 16px;
              cursor: pointer;
              transition: background-color 0.15s;
              border-bottom: 1px solid #dadce0;
            }
            .account-item:last-child {
              border-bottom: none;
            }
            .account-item:hover {
              background-color: #f8f9fa;
            }
            .avatar {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: #3f51b5;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 500;
              font-size: 16px;
              margin-right: 12px;
            }
            .avatar.jane {
              background-color: #e91e63;
            }
            .avatar.new {
              background-color: #f1f3f4;
              color: #5f6368;
            }
            .account-details {
              flex: 1;
              text-align: left;
            }
            .name {
              font-size: 14px;
              font-weight: 500;
            }
            .email {
              font-size: 12px;
              color: #5f6368;
            }
            .footer {
              padding: 24px;
              font-size: 12px;
              color: #5f6368;
              text-align: center;
              border-top: 1px solid #f1f3f4;
            }
            .link {
              color: #1a73e8;
              text-decoration: none;
            }
            .link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <svg class="google-logo" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h1 class="title">Choose an account</h1>
            <p class="subtitle">to continue to YourTee</p>
          </div>

          <div class="content">
            <div class="account-list">
              <div class="account-item" onclick="selectAccount('John Doe', 'john.doe@gmail.com')">
                <div class="avatar">J</div>
                <div class="account-details">
                  <div class="name">John Doe</div>
                  <div class="email">john.doe@gmail.com</div>
                </div>
              </div>
              <div class="account-item" onclick="selectAccount('Jane Smith', 'jane.smith@gmail.com')">
                <div class="avatar jane">J</div>
                <div class="account-details">
                  <div class="name">Jane Smith</div>
                  <div class="email">jane.smith@gmail.com</div>
                </div>
              </div>
              <div class="account-item" onclick="selectAccount('Guest User', 'guest.test@gmail.com')">
                <div class="avatar new">+</div>
                <div class="account-details">
                  <div class="name">Use another account</div>
                  <div class="email">guest.test@gmail.com</div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            To continue, Google will share your name, email address, language preference, and profile picture with YourTee. See their <a class="link" href="#">Privacy Policy</a> and <a class="link" href="#">Terms of Service</a>.
          </div>

          <script>
            function selectAccount(name, email) {
              window.opener.postMessage({ type: 'google-auth-success', name, email }, '*');
              window.close();
            }
          </script>
        </body>
      </html>
    `);

    const messageListener = async (event: MessageEvent) => {
      if (event.data && event.data.type === "google-auth-success") {
        window.removeEventListener("message", messageListener);
        const { name, email } = event.data;
        try {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email }),
          });
          if (res.ok) {
            await refresh();
            router.push("/account");
            router.refresh();
          } else {
            const body = await res.json().catch(() => ({}));
            setServerError(body.error || "Google auth failed.");
          }
        } catch {
          setServerError("Error connecting to auth services.");
        }
      }
    };

    window.addEventListener("message", messageListener);
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join YourTee and design your identity"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full Name" error={errors.name?.message}>
          <input
            autoComplete="name"
            {...register("name")}
            className="auth-input"
            placeholder="Your name"
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="auth-input"
            placeholder="you@email.com"
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className="auth-input pr-11"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {rules.map((r) => (
              <span
                key={r.label}
                className={`flex items-center gap-1 text-[11px] ${
                  r.ok ? "text-gold" : "text-muted"
                }`}
              >
                <Check size={11} /> {r.label}
              </span>
            ))}
          </div>
        </Field>

        {serverError && (
          <p className="border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-gold w-full disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink/10"></div>
          </div>
          <span className="relative bg-bg px-4 text-[10px] uppercase tracking-wider text-muted">
            or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2.5 border border-ink/15 bg-transparent py-3 text-xs uppercase tracking-wider text-ink hover:border-gold hover:text-gold transition-colors font-semibold"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] uppercase tracking-luxe text-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
