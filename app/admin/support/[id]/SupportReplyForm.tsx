"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SupportReplyFormProps = {
  ticketId: number;
  disabled?: boolean;
};

export default function SupportReplyForm({
  ticketId,
  disabled = false,
}: SupportReplyFormProps) {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (disabled || isSubmitting) {
      return;
    }

    const normalizedMessage = message.trim();

    if (!normalizedMessage) {
      setError("Napište odpověď zákazníkovi.");
      return;
    }

    if (normalizedMessage.length > 10000) {
      setError(
        "Zpráva může obsahovat maximálně 10 000 znaků."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/support/${ticketId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: normalizedMessage,
          }),
        }
      );

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "Odpověď se nepodařilo odeslat."
        );
      }

      setMessage("");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Odpověď se nepodařilo odeslat."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="support-reply"
          className="mb-2 block text-sm font-medium text-white/75"
        >
          Odpovědět zákazníkovi
        </label>

        <textarea
          id="support-reply"
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          disabled={disabled || isSubmitting}
          maxLength={10000}
          rows={6}
          placeholder={
            disabled
              ? "Vyřešený ticket nelze dále komentovat."
              : "Napište odpověď zákazníkovi..."
          }
          className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-white/30">
          {message.length} / 10 000
        </div>

        <button
          type="submit"
          disabled={
            disabled ||
            isSubmitting ||
            message.trim().length === 0
          }
          className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting
            ? "Odesílám..."
            : "Odeslat odpověď"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </form>
  );
}