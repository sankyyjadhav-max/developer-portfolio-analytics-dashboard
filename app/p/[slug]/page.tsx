import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
  ExternalLink,
  Code2,
  BriefcaseBusiness,
  GraduationCap,
} from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Project = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  technologies?: string | string[] | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  featured?: boolean;
};

type Skill = {
  id: string;
  name: string;
  category?: string | null;
  level?: number | null;
};

type Experience = {
  id: string;
  company: string;
  role: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
};

type Education = {
  id: string;
  institution: string;
  degree: string;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
};

type Portfolio = {
  id: string;
  userId?: string;

  slug: string;
  name: string;
  headline?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  location?: string | null;
  contactEmail?: string | null;
  phone?: string | null;

  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  websiteUrl?: string | null;
  resumeUrl?: string | null;

  template?: string | null;
  theme?: string | null;
  published?: boolean;

  projects?: Project[];
  skills?: Skill[];
  experiences?: Experience[];
  educations?: Education[];
};

async function getPortfolio(
  slug: string
): Promise<Portfolio | null> {
  try {
    const response = await fetch(
      `${API}/api/portfolio/public/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    /*
      The backend might return:

      {
        id: "...",
        name: "..."
      }

      OR:

      {
        portfolio: {
          id: "...",
          name: "..."
        }
      }

      Handle both formats.
    */
    const portfolio =
      data?.portfolio ??
      data?.data ??
      data;

    if (!portfolio || typeof portfolio !== "object") {
      return null;
    }

    if (!portfolio.id) {
      return null;
    }

    return {
      ...portfolio,

      projects: Array.isArray(portfolio.projects)
        ? portfolio.projects
        : [],

      skills: Array.isArray(portfolio.skills)
        ? portfolio.skills
        : [],

      experiences: Array.isArray(portfolio.experiences)
        ? portfolio.experiences
        : [],

      educations: Array.isArray(portfolio.educations)
        ? portfolio.educations
        : [],
    };
  } catch (error) {
    console.error("Public portfolio fetch failed:", error);
    return null;
  }
}

function technologies(value?: string | string[] | null) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Not JSON, continue.
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value?: string | null) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const portfolio = await getPortfolio(params.slug);

  if (!portfolio) {
    return {
      title: "Portfolio Not Found",
      description: "The requested developer portfolio could not be found.",
    };
  }

  const title = portfolio.headline
    ? `${portfolio.name} | ${portfolio.headline}`
    : `${portfolio.name} | Developer Portfolio`;

  const description =
    portfolio.bio ||
    `${portfolio.name}'s professional developer portfolio.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(portfolio.profileImage
        ? {
            images: [
              {
                url: portfolio.profileImage,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function PublicPortfolio({
  params,
}: {
  params: { slug: string };
}) {
  const portfolio = await getPortfolio(params.slug);

  /*
    IMPORTANT:
    Never access portfolio.id before checking that
    portfolio actually exists.
  */
  if (!portfolio) {
    notFound();
  }

  const projects = portfolio.projects ?? [];
  const skills = portfolio.skills ?? [];
  const experiences = portfolio.experiences ?? [];
  const educations = portfolio.educations ?? [];

  const featuredProjects = projects.filter(
    (project) => project.featured
  );

  const displayProjects =
    featuredProjects.length > 0
      ? featuredProjects
      : projects;

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute right-[-200px] top-[500px] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href={`/p/${portfolio.slug}`}
            className="font-semibold tracking-tight"
          >
            {portfolio.name}
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <a
              href="#about"
              className="transition hover:text-white"
            >
              About
            </a>

            <a
              href="#experience"
              className="transition hover:text-white"
            >
              Experience
            </a>

            <a
              href="#projects"
              className="transition hover:text-white"
            >
              Projects
            </a>

            <a
              href="#contact"
              className="transition hover:text-white"
            >
              Contact
            </a>
          </nav>

          {portfolio.contactEmail && (
            <a
              href={`mailto:${portfolio.contactEmail}`}
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm transition hover:border-white/20 hover:bg-white/5 sm:block"
            >
              Contact
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-center gap-5">
            {portfolio.profileImage ? (
              <img
                src={portfolio.profileImage}
                alt={portfolio.name}
                className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-bold">
                {portfolio.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <p className="text-sm text-zinc-500">
                Developer Portfolio
              </p>

              {portfolio.location && (
                <div className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin size={14} />
                  {portfolio.location}
                </div>
              )}
            </div>
          </div>

          <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-violet-400">
            {portfolio.headline || "Developer"}
          </p>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            {portfolio.name}
          </h1>

          {portfolio.bio && (
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400 md:text-xl">
              {portfolio.bio}
            </p>
          )}

          <div className="mt-9 flex flex-wrap gap-3">
            {portfolio.contactEmail && (
              <a
                href={`mailto:${portfolio.contactEmail}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                <Mail size={16} />
                Get in touch
                <ArrowUpRight size={16} />
              </a>
            )}

            {portfolio.resumeUrl && (
              <a
                href={portfolio.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium transition hover:bg-white/5"
              >
                Resume
                <ExternalLink size={15} />
              </a>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            {portfolio.githubUrl && (
              <a
                href={portfolio.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 transition hover:text-white"
                aria-label="GitHub"
              >
                <Github size={21} />
              </a>
            )}

            {portfolio.linkedinUrl && (
              <a
                href={portfolio.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 transition hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin size={21} />
              </a>
            )}

            {portfolio.twitterUrl && (
              <a
                href={portfolio.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 transition hover:text-white"
                aria-label="Twitter"
              >
                X
              </a>
            )}

            {portfolio.websiteUrl && (
              <a
                href={portfolio.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-500 transition hover:text-white"
                aria-label="Website"
              >
                <GlobeIcon />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-y border-white/10 bg-white/[0.015]"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <SectionLabel>About</SectionLabel>

            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Building useful things with technology.
              </h2>

              <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-zinc-400">
                {portfolio.bio ||
                  "This developer has not added an about section yet."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <SectionLabel>Skills</SectionLabel>

            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="font-medium">
                    {skill.name}
                  </div>

                  {skill.category && (
                    <div className="mt-1 text-xs text-zinc-500">
                      {skill.category}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience */}
      <section
        id="experience"
        className="border-y border-white/10 bg-white/[0.015]"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <SectionLabel>Experience</SectionLabel>

            {experiences.length === 0 ? (
              <EmptySection text="No experience added yet." />
            ) : (
              <div className="space-y-10">
                {experiences.map((experience) => (
                  <article
                    key={experience.id}
                    className="relative border-l border-white/10 pl-7"
                  >
                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-violet-400" />

                    <div className="flex flex-col justify-between gap-2 md:flex-row">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {experience.role}
                        </h3>

                        <p className="mt-1 text-violet-400">
                          {experience.company}
                        </p>
                      </div>

                      <p className="text-sm text-zinc-500">
                        {formatDate(experience.startDate)}
                        {" — "}
                        {experience.current
                          ? "Present"
                          : formatDate(experience.endDate)}
                      </p>
                    </div>

                    {experience.description && (
                      <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-zinc-400">
                        {experience.description}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Education */}
      {educations.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <SectionLabel>Education</SectionLabel>

            <div className="space-y-7">
              {educations.map((education) => (
                <article
                  key={education.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-white/5 p-3">
                      <GraduationCap size={22} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {education.degree}
                      </h3>

                      <p className="mt-1 text-violet-400">
                        {education.institution}
                      </p>

                      {education.field && (
                        <p className="mt-2 text-sm text-zinc-500">
                          {education.field}
                        </p>
                      )}

                      {education.description && (
                        <p className="mt-4 leading-7 text-zinc-400">
                          {education.description}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      <section
        id="projects"
        className="border-y border-white/10 bg-white/[0.015]"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <SectionLabel>Projects</SectionLabel>

            {displayProjects.length === 0 ? (
              <EmptySection text="No projects added yet." />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {displayProjects.map((project) => {
                  const tech = technologies(
                    project.technologies
                  );

                  return (
                    <article
                      key={project.id}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                    >
                      {project.image && (
                        <div className="aspect-video overflow-hidden border-b border-white/10">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-violet-400">
                              <Code2 size={14} />
                              Project
                            </div>

                            <h3 className="text-xl font-semibold">
                              {project.title}
                            </h3>
                          </div>

                          {project.featured && (
                            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-xs text-violet-300">
                              Featured
                            </span>
                          )}
                        </div>

                        {project.description && (
                          <p className="mt-4 leading-7 text-zinc-400">
                            {project.description}
                          </p>
                        )}

                        {tech.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {tech.map((item) => (
                              <span
                                key={item}
                                className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-zinc-400"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 flex gap-3">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5"
                            >
                              <Github size={15} />
                              GitHub
                            </a>
                          )}

                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                            >
                              Live Demo
                              <ArrowUpRight size={15} />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="mx-auto max-w-6xl px-6 py-24"
      >
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center md:p-16">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
            <BriefcaseBusiness size={22} />
          </div>

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Let's build something great.
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-zinc-400">
            Interested in working together or discussing a project?
            Get in touch.
          </p>

          {portfolio.contactEmail && (
            <a
              href={`mailto:${portfolio.contactEmail}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:scale-[1.02]"
            >
              <Mail size={17} />
              {portfolio.contactEmail}
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {portfolio.name}
          </p>

          <p>
            Built with DevPulse
          </p>
        </div>
      </footer>
    </main>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
      {children}
    </div>
  );
}

function EmptySection({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-zinc-500">
      {text}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}