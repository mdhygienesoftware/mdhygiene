import Image from "next/image";
import type { TeamMember } from "@/lib/types";

/** Public team grid. Renders nothing when no one is published. */
export default function TeamSection({ members }: { members: TeamMember[] }) {
  if (!members.length) return null;

  return (
    <section className="px-6 md:px-14 py-16 bg-white border-t border-border">
      <div className="flex flex-col gap-2 mb-9">
        <span className="text-[13px] font-bold tracking-[0.14em] text-pink uppercase">Our team</span>
        <h2 className="text-3xl md:text-[36px] font-extrabold text-navy">The people behind M.D. Hygiene</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => (
          <article key={member.id} className="flex flex-col gap-3">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F5E1EA]">
              {member.photo_url ? (
                <Image
                  src={member.photo_url}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-pink/50">
                  {member.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-navy leading-tight">{member.name}</h3>
              {member.designation && <p className="text-sm text-muted-2 mt-0.5">{member.designation}</p>}
              {member.department && <p className="text-xs text-muted mt-0.5">{member.department}</p>}
            </div>
            {member.bio && <p className="text-sm text-muted-2 leading-relaxed">{member.bio}</p>}
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-semibold text-blue"
              >
                LinkedIn →
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
