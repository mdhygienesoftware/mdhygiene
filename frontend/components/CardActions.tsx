"use client";

import { useState } from "react";
import SocialIcon from "@/components/SocialIcons";
import type { TeamMember } from "@/lib/types";

/**
 * Contact actions for a digital visiting card. "Save contact" builds a vCard
 * client-side so it works without a round trip — the whole point of handing
 * someone the card link.
 */
export default function CardActions({ member }: { member: TeamMember }) {
  const [copied, setCopied] = useState(false);

  const tel = member.phone?.replace(/\s+/g, "") ?? "";
  const wa = member.whatsapp?.replace(/[^\d+]/g, "") ?? tel.replace(/[^\d+]/g, "");

  function saveContact() {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${member.name.split(" ").slice(1).join(" ")};${member.name.split(" ")[0]};;;`,
      `FN:${member.name}`,
      "ORG:M.D. Hygiene Private Limited",
      member.designation ? `TITLE:${member.designation}` : "",
      member.phone ? `TEL;TYPE=CELL:${member.phone}` : "",
      member.email ? `EMAIL;TYPE=WORK:${member.email}` : "",
      "URL:https://www.mdhygiene.in/",
      member.intro ? `NOTE:${member.intro}` : "",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${member.slug ?? member.name.replace(/\s+/g, "-").toLowerCase()}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function share() {
    const url = window.location.href;
    const data = { title: member.name, text: `${member.name} — M.D. Hygiene`, url };
    // Native share sheet on mobile; clipboard everywhere else.
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; nothing useful to do
    }
  }

  return (
    <div className="w-full flex flex-col gap-2.5 mt-5">
      <div className="grid grid-cols-2 gap-2.5">
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="bg-[#F2F6FA] hover:bg-navy hover:text-white text-navy rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <SocialIcon name="email" className="w-4 h-4" />
            Email
          </a>
        )}
        {tel && (
          <a
            href={`tel:${tel}`}
            className="bg-[#F2F6FA] hover:bg-navy hover:text-white text-navy rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <SocialIcon name="phone" className="w-4 h-4" />
            Call
          </a>
        )}
      </div>

      {wa && (
        <a
          href={`https://wa.me/${wa.replace(/^\+/, "")}?text=${encodeURIComponent("I'm interested in your products")}`}
          target="_blank"
          rel="noreferrer noopener"
          className="bg-[#25D366] hover:brightness-95 text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <SocialIcon name="whatsapp" className="w-4 h-4" />
          WhatsApp
        </a>
      )}

      <button
        type="button"
        onClick={saveContact}
        className="bg-navy hover:bg-pink text-white rounded-xl py-3 font-semibold text-sm transition-colors"
      >
        Save to contacts
      </button>

      <button
        type="button"
        onClick={share}
        className="border border-border hover:border-pink text-navy rounded-xl py-3 font-semibold text-sm transition-colors"
      >
        {copied ? "Link copied ✓" : "Share this card"}
      </button>
    </div>
  );
}
