"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(2, "Add a subject"),
  message: z.string().min(10, "Tell us a little more"),
});

type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 900));
    setSent(true);
    reset();
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen pb-28">
      <PageHeader
        eyebrow="Contact"
        title="Let's Talk"
        subtitle="Questions, collaborations, or bespoke commissions — we'd love to hear from you."
      />

      <div className="container-luxe grid gap-16 lg:grid-cols-[1fr_1.3fr]">
        {/* Info */}
        <div className="space-y-8">
          {[
            { icon: Mail, label: "Email", value: "care@yourtee.in" },
            { icon: Phone, label: "Phone", value: "+91 98200 41902" },
            { icon: MapPin, label: "Atelier", value: "14 Linking Road, Bandra West, Mumbai" },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-4">
              <span className="grid h-11 w-11 place-items-center border border-ink/15 text-gold">
                <c.icon size={18} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-luxe text-muted">{c.label}</p>
                <p className="mt-1">{c.value}</p>
              </div>
            </div>
          ))}
          <div className="border border-ink/10 bg-card p-6">
            <p className="font-serif text-xl">Atelier Hours</p>
            <p className="mt-2 text-sm text-muted">Mon–Fri · 10am – 8pm IST</p>
            <p className="text-sm text-muted">Sat · 11am – 5pm IST</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 border border-ink/10 bg-card p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" error={errors.name?.message}>
              <input
                {...register("name")}
                className="input-luxe"
                placeholder="Your name"
              />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input
                {...register("email")}
                className="input-luxe"
                placeholder="you@email.com"
              />
            </Field>
          </div>
          <Field label="Subject" error={errors.subject?.message}>
            <input
              {...register("subject")}
              className="input-luxe"
              placeholder="How can we help?"
            />
          </Field>
          <Field label="Message" error={errors.message?.message}>
            <textarea
              {...register("message")}
              rows={5}
              className="input-luxe resize-none"
              placeholder="Your message…"
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold w-full disabled:opacity-60"
          >
            {sent ? (
              <>
                <Check size={14} /> Message Sent
              </>
            ) : isSubmitting ? (
              "Sending…"
            ) : (
              "Send Message"
            )}
          </button>
          {sent && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-gold"
            >
              Thank you — we'll be in touch within 24 hours.
            </motion.p>
          )}
        </form>
      </div>

      <style jsx global>{`
        .input-luxe {
          width: 100%;
          background: transparent;
          border: 1px solid rgb(var(--line) / 0.15);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-luxe:focus {
          border-color: #d4af37;
        }
        .input-luxe::placeholder {
          color: rgb(var(--muted));
        }
      `}</style>
    </div>
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
      <label className="mb-2 block text-[10px] uppercase tracking-luxe text-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
