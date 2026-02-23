"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Link2, Check, MessageCircle, Mail, Users } from "lucide-react";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  variant?: "button" | "icon";
}

export function SocialShare({
  url,
  title,
  description,
  variant = "button",
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${url}`
    : url;

  const shareText = description
    ? `${title} — ${description}`
    : title;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: fullUrl });
      } catch {
        // User cancelled
      }
    }
  }

  function handleWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${fullUrl}`)}`,
      "_blank"
    );
  }

  function handleEmail() {
    window.open(
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        `${shareText}\n\n${fullUrl}`
      )}`
    );
  }

  function handleTrainerShare() {
    const trainerText = `Check out this horse on ManeExchange:\n\n${title}\n${fullUrl}`;
    if (navigator.share) {
      navigator.share({ title: `Horse: ${title}`, text: trainerText, url: fullUrl });
    } else {
      navigator.clipboard.writeText(trainerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const shareOptions = [
    {
      label: "Share with Trainer",
      icon: Users,
      onClick: handleTrainerShare,
      className: "bg-paper-warm hover:bg-paper-cream border-crease-mid",
      featured: true,
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      onClick: handleWhatsApp,
      className: "",
    },
    {
      label: "Email",
      icon: Mail,
      onClick: handleEmail,
      className: "",
    },
    {
      label: copied ? "Link Copied!" : "Copy Link",
      icon: copied ? Check : Link2,
      onClick: handleCopyLink,
      className: copied ? "text-forest" : "",
    },
  ];

  // Check if native Web Share API is supported
  const hasNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-mid transition-colors hover:bg-paper-warm hover:text-ink-black"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Share this listing</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.label}
                onClick={option.onClick}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium transition-colors hover:bg-paper-warm ${
                  option.featured
                    ? "border border-crease-mid bg-paper-cream"
                    : ""
                } ${option.className}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{option.label}</span>
                {option.featured && (
                  <span className="text-xs text-ink-light">Recommended</span>
                )}
              </button>
            );
          })}

          {hasNativeShare && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-crease-light" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-paper-white px-2 text-ink-light">or</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleNativeShare}
              >
                More sharing options...
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
