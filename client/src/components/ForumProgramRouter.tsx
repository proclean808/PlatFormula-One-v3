import { useId, useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import {
  DEFAULT_FORUM_PROFILE,
  FORUM_DISCLOSURE,
  FORUM_EXTERNAL_LINK_PROPS,
  FORUM_FOUNDER_PROGRAM_IDS,
  FORUM_INDUSTRY_COUNCIL,
  FORUM_PROGRAMS,
  FORUM_REVIEW_DATE,
  FORUM_URLS,
  getForumHandoffs,
  recommendForumProgram,
  type ForumGoal,
  type ForumProfile,
  type ForumProgram,
} from "@shared/forumPrograms";

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#181321]";
const linkClass = `inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border border-violet-300/30 px-3 py-2 text-xs font-semibold text-violet-100 hover:bg-violet-400/10 ${focusClass}`;

function ProfileSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-violet-100">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={event => onChange(event.target.value as T)}
        className={`min-h-11 w-full min-w-0 rounded-xl border border-violet-200/25 bg-[#181321] px-3 py-2 text-sm text-white ${focusClass}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProgramCard({
  program,
  selected,
}: {
  program: ForumProgram;
  selected?: boolean;
}) {
  return (
    <article
      className={`flex min-w-0 flex-col gap-3 rounded-xl border p-4 ${selected ? "border-violet-300/60 bg-violet-400/10" : "border-violet-200/20 bg-white/5"}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">
        {program.relationship}
      </p>
      <h3 className="text-base font-semibold text-white">{program.name}</h3>
      <p className="text-sm leading-relaxed text-violet-100/80">
        {program.summary}
      </p>
      {program.id === "foundry" && (
        <p className="text-xs font-medium text-amber-200">
          Published November cohort has passed. Future availability unverified.
        </p>
      )}
      <details className="text-xs text-violet-100/80">
        <summary
          className={`flex min-h-11 cursor-pointer items-center font-semibold text-violet-200 ${focusClass}`}
        >
          Published terms and cautions
        </summary>
        <div className="space-y-2 pb-2 leading-relaxed">
          <p>{program.publishedTerms}</p>
          <p>{program.caution}</p>
          <p className="text-violet-200/60">
            Source reviewed {program.source.reviewedOn}: {program.source.note}
          </p>
        </div>
      </details>
      <a
        href={program.source.url}
        {...FORUM_EXTERNAL_LINK_PROPS}
        className={`${linkClass} mt-auto`}
        aria-label={`Read official ${program.name} information in a new tab`}
      >
        Read official information{" "}
        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </a>
    </article>
  );
}

/** A controlled view so both gate states can be verified without a browser or network. */
export function ForumDisclosureReview({
  goal,
  reviewed,
  onReviewChange,
  id,
}: {
  goal: ForumGoal;
  reviewed: boolean;
  onReviewChange: (reviewed: boolean) => void;
  id: string;
}) {
  const handoffs = getForumHandoffs(reviewed, goal);
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="space-y-3 rounded-xl border border-violet-300/25 bg-black/20 p-4 sm:p-5"
    >
      <h3
        id={`${id}-title`}
        className="flex items-center gap-2 text-base font-semibold text-violet-100"
      >
        <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
        Before an application handoff
      </h3>
      <p className="text-xs leading-relaxed text-violet-100/80">
        {FORUM_DISCLOSURE.review}
      </p>
      <p className="text-xs leading-relaxed text-amber-100/90">
        {FORUM_DISCLOSURE.feedbackWarning}
      </p>
      <a
        href={FORUM_URLS.terms}
        {...FORUM_EXTERNAL_LINK_PROPS}
        className={linkClass}
      >
        Read Forum's website Terms of Use
        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </a>
      <label
        htmlFor={`${id}-checkbox`}
        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-violet-200/20 p-3 text-sm leading-relaxed text-violet-100"
      >
        <input
          id={`${id}-checkbox`}
          type="checkbox"
          checked={reviewed}
          onChange={event => onReviewChange(event.target.checked)}
          className={`h-11 w-11 shrink-0 cursor-pointer accent-violet-400 ${focusClass}`}
        />
        <span>{FORUM_DISCLOSURE.acknowledgement}</span>
      </label>
      {handoffs.length > 0 ? (
        <div className="space-y-3" data-disclosure-gate="reviewed">
          <p className="text-xs leading-relaxed text-violet-200/80">
            {goal === "talent"
              ? "The next link opens the external talent form; nothing is submitted here."
              : "These links open Forum's official information pages, where you can review its application options. No application URLs or intake IDs are invented here."}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {handoffs.map(program => (
              <a
                key={program.id}
                href={program.handoff.url}
                {...FORUM_EXTERNAL_LINK_PROPS}
                className={linkClass}
                data-forum-handoff={program.id}
              >
                {program.handoff.label}
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      ) : (
        <p
          role="status"
          className="text-xs text-violet-200/70"
          data-disclosure-gate="locked"
        >
          {reviewed
            ? "Choose founder or talent above to show that route's handoff links."
            : "Application handoff links stay hidden until you review and check the acknowledgement. Official information remains available above."}
        </p>
      )}
    </section>
  );
}

export default function ForumProgramRouter({
  initialProfile = {},
}: {
  initialProfile?: Partial<ForumProfile>;
}) {
  const id = useId();
  const [profile, setProfile] = useState<ForumProfile>(() => ({
    ...DEFAULT_FORUM_PROFILE,
    ...initialProfile,
  }));
  const [reviewed, setReviewed] = useState(false);
  const recommendation = recommendForumProgram(profile);

  function update<K extends keyof ForumProfile>(
    key: K,
    value: ForumProfile[K]
  ) {
    setProfile(current => ({ ...current, [key]: value }));
    // A changed route/profile requires another deliberate local disclosure review.
    setReviewed(false);
  }

  return (
    <section
      id="forum-program-router"
      data-forum-router
      aria-labelledby={`${id}-title`}
      className="scroll-mt-48 space-y-5 rounded-2xl border border-violet-300/25 bg-gradient-to-br from-[#302048] to-[#181321] p-5 text-white sm:p-7"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
          Independent program finder · External Resource
        </p>
        <h2
          id={`${id}-title`}
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Which Forum route is worth exploring?
        </h2>
        <p className="text-sm leading-relaxed text-violet-100/80">
          Use your actual stage—not a funding promise. PlatFormula.One is not a
          Forum partner or licensed white-label backend. This finder does not
          clear eligibility or guarantee admission, investment, introductions or
          pilots.
        </p>
        <p className="text-xs leading-relaxed text-violet-200/70">
          {FORUM_DISCLOSURE.local}
        </p>
      </header>

      <ProfileSelect<ForumProfile["goal"]>
        id={`${id}-goal`}
        label="What are you looking for?"
        value={profile.goal}
        onChange={value => update("goal", value)}
        options={[
          { value: "unknown", label: "Choose a goal" },
          { value: "founder", label: "Founder validation or investment" },
          { value: "talent", label: "Talent / venture-building roles" },
        ]}
      />
      {profile.goal === "founder" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileSelect<ForumProfile["stage"]>
              id={`${id}-stage`}
              label="Actual product / company stage"
              value={profile.stage}
              onChange={value => update("stage", value)}
              options={[
                { value: "unknown", label: "Not specified" },
                { value: "idea", label: "Pre-idea / problem exploration" },
                { value: "concept", label: "Concept / validation" },
                {
                  value: "prototype",
                  label: "Prototype / near-MVP (not in market)",
                },
                { value: "live", label: "Live MVP in market" },
              ]}
            />
            <ProfileSelect<ForumProfile["b2b"]>
              id={`${id}-b2b`}
              label="Is this B2B software?"
              value={profile.b2b}
              onChange={value => update("b2b", value)}
              options={[
                { value: "unsure", label: "Unsure" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </div>
          <details className="rounded-xl border border-violet-200/20 bg-black/10 px-4">
            <summary
              className={`flex min-h-11 cursor-pointer items-center py-3 text-sm font-semibold text-violet-200 ${focusClass}`}
            >
              Refine Studio / investment fit: expertise, funding and traction
            </summary>
            <div className="grid gap-4 pb-4 sm:grid-cols-2">
              <ProfileSelect<ForumProfile["domainExpertise"]>
                id={`${id}-expertise`}
                label="Firsthand domain expertise?"
                value={profile.domainExpertise}
                onChange={value => update("domainExpertise", value)}
                options={[
                  { value: "unknown", label: "Not specified" },
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
              <ProfileSelect<ForumProfile["funding"]>
                id={`${id}-funding`}
                label="Previously raised funding (USD)"
                value={profile.funding}
                onChange={value => update("funding", value)}
                options={[
                  { value: "unknown", label: "Not specified" },
                  {
                    value: "under-500k",
                    label: "Less than $500K (including $0)",
                  },
                  { value: "at-least-500k", label: "$500K or more" },
                ]}
              />
              <ProfileSelect<ForumProfile["traction"]>
                id={`${id}-traction`}
                label="Current traction evidence"
                value={profile.traction}
                onChange={value => update("traction", value)}
                options={[
                  { value: "unknown", label: "Not specified" },
                  { value: "none", label: "No meaningful traction yet" },
                  {
                    value: "design-partners",
                    label: "Design partners / early traction",
                  },
                  { value: "at-least-250k-arr", label: "$250K ARR or more" },
                ]}
              />
              {(profile.stage === "idea" || profile.stage === "concept") && (
                <>
                  <ProfileSelect<ForumProfile["aiNative"]>
                    id={`${id}-ai-native`}
                    label="AI-native product / company?"
                    value={profile.aiNative}
                    onChange={value => update("aiNative", value)}
                    options={[
                      { value: "unknown", label: "Not specified" },
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                  <ProfileSelect<ForumProfile["formation"]>
                    id={`${id}-formation`}
                    label="Has the company already formed?"
                    value={profile.formation}
                    onChange={value => update("formation", value)}
                    options={[
                      { value: "unknown", label: "Not specified" },
                      {
                        value: "not-formed",
                        label: "Not formed / incorporated yet",
                      },
                      {
                        value: "formed",
                        label: "Already formed / incorporated",
                      },
                    ]}
                  />
                </>
              )}
              <p className="text-xs leading-relaxed text-violet-200/70 sm:col-span-2">
                Forum's published filters are only a starting point.
                Accelerator: MVP or near-MVP and less than $500K raised.
                Pre-Seed: MVP in market, meaningful traction and domain
                expertise; typically at least $500K raised OR at least $250K
                ARR.
              </p>
            </div>
          </details>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        className="space-y-3 rounded-xl border border-violet-300/25 bg-black/20 p-4"
        data-recommendation={recommendation.recommendedProgram ?? "none"}
        data-recommendation-status={recommendation.status}
      >
        <h3 className="text-base font-semibold text-violet-100">
          {recommendation.headline}
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-violet-100/80">
          {recommendation.reasons.map(reason => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        {recommendation.unknowns.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-violet-200">
              Unknowns—not assumed true
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-violet-200/75">
              {recommendation.unknowns.map(unknown => (
                <li key={unknown}>{unknown}</li>
              ))}
            </ul>
          </div>
        )}
        {recommendation.cautions.map(caution => (
          <p
            key={caution}
            className="text-xs leading-relaxed text-amber-100/90"
          >
            {caution}
          </p>
        ))}
      </div>

      {profile.goal !== "talent" && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-violet-100">
            Founder routes · compare official information
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {FORUM_FOUNDER_PROGRAM_IDS.map(programId => (
              <ProgramCard
                key={programId}
                program={FORUM_PROGRAMS[programId]}
                selected={recommendation.recommendedProgram === programId}
              />
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3" aria-label="Separate Talent Network pathway">
        <h3 className="text-sm font-semibold text-violet-100">
          Talent is a separate path—not founder funding
        </h3>
        <ProgramCard
          program={FORUM_PROGRAMS.talent}
          selected={profile.goal === "talent"}
        />
        {profile.goal !== "talent" && (
          <button
            type="button"
            onClick={() => update("goal", "talent")}
            className={linkClass}
          >
            Explore the separate talent path
          </button>
        )}
      </div>

      <ForumDisclosureReview
        goal={profile.goal}
        reviewed={reviewed}
        onReviewChange={setReviewed}
        id={`${id}-disclosure`}
      />

      <aside
        className="space-y-2 rounded-xl border border-violet-200/20 bg-white/5 p-4"
        aria-label={FORUM_INDUSTRY_COUNCIL.name}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-300">
          External Resource · Customer-discovery reference
        </p>
        <h3 className="text-sm font-semibold text-violet-100">
          {FORUM_INDUSTRY_COUNCIL.name}
        </h3>
        <p className="text-xs leading-relaxed text-violet-200/80">
          {FORUM_INDUSTRY_COUNCIL.description}
        </p>
        <a
          href={FORUM_INDUSTRY_COUNCIL.url}
          {...FORUM_EXTERNAL_LINK_PROPS}
          className={linkClass}
        >
          Read the official Industry Council page
          <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
      </aside>
      <p className="text-xs leading-relaxed text-violet-200/60">
        Source review: {FORUM_REVIEW_DATE}. Program terms, future cohort dates
        and availability can change; the official provider makes all decisions.
        No Forum logos, funding-rate claims or portfolio statistics are
        reproduced.
      </p>
    </section>
  );
}
