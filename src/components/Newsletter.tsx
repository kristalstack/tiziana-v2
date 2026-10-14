"use client";

import { useState } from "react";
export default function Newsletter({ locale }: { locale: string }) {
  const isSpanish = locale === "es";

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);


  async function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Subscription failed");
      }

      setIsSuccess(true);
      setMessage(
        isSpanish
          ? "Gracias por suscribirte."
          : "Thanks for subscribing."
      );
      setEmail("");
    } catch {
      setMessage(
        isSpanish
          ? "No pudimos procesar tu suscripción. Inténtalo de nuevo."
          : "We couldn't process your subscription. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <section className="bg-[#F9F4F0] text-[#17204A]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#5266BA]">
            {isSpanish ? "Sigue explorando" : "Stay curious"}
          </p>

          <h2 className="max-w-xl text-4xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">
            {isSpanish
              ? "Psicología para tomar mejores decisiones en el dating."
              : "Psychology for better dating decisions."}
          </h2>
        </div>

        <div className="max-w-xl">
          <p className="text-lg leading-8 text-[#565D78]">
  {isSpanish
    ? "Suscríbete al newsletter y recibe artículos, investigaciones y consejos prácticos para entender mejor las relaciones, reconocer patrones en el dating y tomar decisiones más conscientes."
    : "Subscribe to the newsletter for research-backed insights and practical advice to better understand relationships, recognize dating patterns, and make more informed decisions."}
</p>

          <form
  onSubmit={handleSubscribe}
  className="mt-8 flex flex-col gap-3 sm:flex-row"
>
            <input
              type="email"
              value={email}
onChange={(event) => setEmail(event.target.value)}
required
              placeholder={
                isSpanish ? "Tu correo electrónico" : "Your email address"
              }
              className="min-h-12 flex-1 border border-[#DCCDDD] bg-white px-4 text-[#17204A] outline-none placeholder:text-[#9C8A9E] focus:border-[#7059DA]"
            />

            <button
  type="submit"
  disabled={isSubmitting}
  className="min-h-12 rounded-full bg-[#17204A] px-7 font-semibold text-white transition hover:bg-[#7059DA]"
>
  {isSubmitting
    ? isSpanish
      ? "Enviando..."
      : "Submitting..."
    : isSpanish
      ? "Unirme al newsletter"
      : "Join the newsletter"}
</button>
          </form>

          {message && (
  <p
    role="status"
    aria-live="polite"
    className={`mt-4 text-sm ${
      isSuccess ? "text-[#326B4E]" : "text-[#B52E59]"
    }`}
  >
    {message}
  </p>
)}

          <p className="mt-3 text-xs text-[#75647A]">
  {isSpanish
    ? "Te enviaremos contenidos sobre relaciones y psicología. Puedes darte de baja cuando quieras."
    : "We’ll only email you about the project. You can request to unsubscribe anytime."}
</p>
        </div>
      </div>
    </section>
  );
}