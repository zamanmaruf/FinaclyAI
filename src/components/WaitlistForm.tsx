"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { joinWaitlist } from "@/app/actions/waitlist";

interface WaitlistFormProps {
  source?: string;
  className?: string;
  buttonText?: string;
  placeholder?: string;
}

export function WaitlistForm({ 
  source = "unknown", 
  className = "",
  buttonText = "Join Waitlist",
  placeholder = "Enter your email"
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("source", source);

      const result = await joinWaitlist(formData);

      if (result.success) {
        setMessage({ type: "success", text: "Thanks! You're on the waitlist." });
        setEmail("");
      } else {
        setMessage({ type: "error", text: result.error || "Something went wrong. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-3 ${className}`}>
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        disabled={isLoading}
      />
      <Button
        type="submit"
        variant="primary"
        disabled={isLoading}
        className="whitespace-nowrap"
      >
        {isLoading ? "Joining..." : buttonText}
      </Button>
      
      {message && (
        <div className={`mt-2 text-sm ${
          message.type === "success" ? "text-emerald-600" : "text-red-600"
        }`}>
          {message.text}
        </div>
      )}
    </form>
  );
}
