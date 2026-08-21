import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { auth } from "./middleware/auth.js";
import { prisma } from "./lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import PDFDocument from "pdfkit";

const app = express();

/* =========================================================
   GLOBAL MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:3000",
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 200,
  })
);

/* =========================================================
   AUTH
========================================================= */

const sign = (id: string) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "dev-secret",
    {
      expiresIn: "7d",
    }
  );
};

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", (_req, res) => {
  return res.json({
    ok: true,
  });
});

/* =========================================================
   REGISTER
========================================================= */

app.post("/api/auth/register", async (req, res) => {
  const schema = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      confirmPassword: z.string(),
    })
    .refine(
      (data) =>
        data.password === data.confirmPassword,
      {
        path: ["confirmPassword"],
        message: "Passwords do not match",
      }
    );

  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error:
        parsed.error.issues[0]?.message ||
        "Invalid registration data",
    });
  }

  try {
    const email =
      parsed.data.email.toLowerCase();

    const exists =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (exists) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    const slugBase =
      parsed.data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      "developer";

    const user =
      await prisma.user.create({
        data: {
          name: parsed.data.name,
          email,
          password:
            await bcrypt.hash(
              parsed.data.password,
              12
            ),

          portfolio: {
            create: {
              name: parsed.data.name,
              slug: `${slugBase}-${Date.now().toString(
                36
              )}`,
              headline:
                "AI & ML Developer",
            },
          },
        },
      });

    return res.status(201).json({
      token: sign(user.id),

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      error: "Registration failed",
    });
  }
});

/* =========================================================
   LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string(),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error:
        "Valid email and password are required",
    });
  }

  try {
    const user =
      await prisma.user.findUnique({
        where: {
          email:
            parsed.data.email.toLowerCase(),
        },
      });

    if (
      !user ||
      !(await bcrypt.compare(
        parsed.data.password,
        user.password
      ))
    ) {
      return res.status(401).json({
        error:
          "Invalid email or password",
      });
    }

    return res.json({
      token: sign(user.id),

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      error: "Login failed",
    });
  }
});

/* =========================================================
   GET PORTFOLIO
========================================================= */

app.get(
  "/api/portfolio",
  auth,
  async (req, res) => {
    try {
      const portfolio =
        await prisma.portfolio.findUnique({
          where: {
            userId: req.userId!,
          },

          include: {
            projects: true,
            skills: true,
            experiences: true,
            educations: true,
          },
        });

      if (!portfolio) {
        return res.status(404).json({
          error: "Portfolio not found",
        });
      }

      return res.json(portfolio);
    } catch (error) {
      console.error(
        "GET PORTFOLIO ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load portfolio",
      });
    }
  }
);

/* =========================================================
   PORTFOLIO VALIDATION
========================================================= */

const optionalString = () =>
  z.string().nullable().optional();

const optionalUrl = () =>
  z
    .union([
      z.string().url(),
      z.literal(""),
      z.null(),
    ])
    .optional();

const portfolioSchema = z.object({
  name: z.string().min(1),

  headline: z
    .string()
    .max(120),

  bio: z.string(),

  slug: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers and hyphens"
    ),

  profileImage:
    optionalString(),

  location:
    optionalString(),

  contactEmail:
    z
      .union([
        z.string().email(),
        z.literal(""),
        z.null(),
      ])
      .optional(),

  phone:
    optionalString(),

  githubUrl:
    optionalUrl(),

  linkedinUrl:
    optionalUrl(),

  twitterUrl:
    optionalUrl(),

  websiteUrl:
    optionalUrl(),

  resumeUrl:
    optionalUrl(),

  template:
    z.string(),

  theme:
    z.string(),

  published:
    z.boolean(),
});

/* =========================================================
   UPDATE PORTFOLIO
========================================================= */

app.put(
  "/api/portfolio",
  auth,
  async (req, res) => {
    console.log(
      "UPDATE PORTFOLIO REQUEST:",
      req.body
    );

    const parsed =
      portfolioSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      console.error(
        "PORTFOLIO VALIDATION ERROR:",
        parsed.error.issues
      );

      return res.status(400).json({
        error:
          parsed.error.issues[0]
            ?.message ||
          "Invalid portfolio data",
      });
    }

    try {
      const existingPortfolio =
        await prisma.portfolio.findUnique({
          where: {
            userId: req.userId!,
          },
        });

      if (!existingPortfolio) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      const slugOwner =
        await prisma.portfolio.findFirst({
          where: {
            slug: parsed.data.slug,

            NOT: {
              id: existingPortfolio.id,
            },
          },
        });

      if (slugOwner) {
        return res.status(409).json({
          error:
            "This portfolio slug is already in use",
        });
      }

      const updatedPortfolio =
        await prisma.portfolio.update({
          where: {
            id: existingPortfolio.id,
          },

          data: {
            name:
              parsed.data.name,

            headline:
              parsed.data.headline,

            bio:
              parsed.data.bio,

            slug:
              parsed.data.slug,

            profileImage:
              parsed.data
                .profileImage ??
              null,

            location:
              parsed.data.location ??
              null,

            contactEmail:
              parsed.data
                .contactEmail || null,

            phone:
              parsed.data.phone ??
              null,

            githubUrl:
              parsed.data.githubUrl ||
              null,

            linkedinUrl:
              parsed.data
                .linkedinUrl ||
              null,

            twitterUrl:
              parsed.data.twitterUrl ||
              null,

            websiteUrl:
              parsed.data.websiteUrl ||
              null,

            resumeUrl:
              parsed.data.resumeUrl ||
              null,

            template:
              parsed.data.template,

            theme:
              parsed.data.theme,

            published:
              parsed.data.published,
          },
        });

      console.log(
        "PORTFOLIO UPDATED:",
        updatedPortfolio.id
      );

      return res.json(
        updatedPortfolio
      );
    } catch (error: any) {
      console.error(
        "UPDATE PORTFOLIO ERROR:",
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          "Failed to save portfolio",
      });
    }
  }
);

/* =========================================================
   PUBLIC PORTFOLIO
========================================================= */

app.get(
  "/api/portfolio/public/:slug",
  async (req, res) => {
    try {
      const portfolio =
        await prisma.portfolio.findUnique({
          where: {
            slug: req.params.slug,
          },

          include: {
            projects: true,
            skills: true,
            experiences: true,
            educations: true,
          },
        });

      if (
        !portfolio ||
        !portfolio.published
      ) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      return res.json(portfolio);
    } catch (error) {
      console.error(
        "PUBLIC PORTFOLIO ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load portfolio",
      });
    }
  }
);

/* =========================================================
   GET PROJECTS
========================================================= */

app.get(
  "/api/projects",
  auth,
  async (req, res) => {
    try {
      const portfolio =
        await prisma.portfolio.findUnique({
          where: {
            userId: req.userId!,
          },
        });

      if (!portfolio) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      const projects =
        await prisma.project.findMany({
          where: {
            portfolioId:
              portfolio.id,
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      return res.json(projects);
    } catch (error) {
      console.error(
        "GET PROJECTS ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load projects",
      });
    }
  }
);

/* =========================================================
   PROJECT VALIDATION
========================================================= */

const projectSchema =
  z.object({
    title:
      z.string().min(1),

    description:
      z.string().min(1),

    image:
      z
        .union([
          z.string(),
          z.literal(""),
          z.null(),
        ])
        .optional(),

    technologies:
      z.string(),

    githubUrl:
      optionalUrl(),

    liveUrl:
      optionalUrl(),

    featured:
      z.boolean(),
  });

/* =========================================================
   CREATE PROJECT
========================================================= */

app.post(
  "/api/projects",
  auth,
  async (req, res) => {
    const parsed =
      projectSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      return res.status(400).json({
        error:
          parsed.error.issues[0]
            ?.message ||
          "Invalid project data",
      });
    }

    try {
      const portfolio =
        await prisma.portfolio.findUnique({
          where: {
            userId: req.userId!,
          },
        });

      if (!portfolio) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      const project =
        await prisma.project.create({
          data: {
            title:
              parsed.data.title,

            description:
              parsed.data
                .description,

            image:
              parsed.data.image ||
              null,

            technologies:
              parsed.data
                .technologies,

            githubUrl:
              parsed.data
                .githubUrl ||
              null,

            liveUrl:
              parsed.data.liveUrl ||
              null,

            featured:
              parsed.data.featured,

            portfolioId:
              portfolio.id,
          },
        });

      return res
        .status(201)
        .json(project);
    } catch (error) {
      console.error(
        "CREATE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to create project",
      });
    }
  }
);

/* =========================================================
   UPDATE PROJECT
========================================================= */

app.put(
  "/api/projects/:id",
  auth,
  async (req, res) => {
    const parsed =
      projectSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      return res.status(400).json({
        error:
          parsed.error.issues[0]
            ?.message ||
          "Invalid project data",
      });
    }

    try {
      const portfolio =
        await prisma.portfolio.findUnique({
          where: {
            userId: req.userId!,
          },
        });

      if (!portfolio) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      const existingProject =
        await prisma.project.findFirst({
          where: {
            id: req.params.id,
            portfolioId:
              portfolio.id,
          },
        });

      if (!existingProject) {
        return res.status(404).json({
          error: "Project not found",
        });
      }

      const updatedProject =
        await prisma.project.update({
          where: {
            id: existingProject.id,
          },

          data: {
            title:
              parsed.data.title,

            description:
              parsed.data
                .description,

            image:
              parsed.data.image ||
              null,

            technologies:
              parsed.data
                .technologies,

            githubUrl:
              parsed.data
                .githubUrl ||
              null,

            liveUrl:
              parsed.data.liveUrl ||
              null,

            featured:
              parsed.data.featured,
          },
        });

      return res.json(
        updatedProject
      );
    } catch (error) {
      console.error(
        "UPDATE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to update project",
      });
    }
  }
);

/* =========================================================
   DELETE PROJECT
========================================================= */

app.delete(
  "/api/projects/:id",
  auth,
  async (req, res) => {
    try {
      const portfolio =
        await prisma.portfolio.findUnique({
          where: {
            userId: req.userId!,
          },
        });

      if (!portfolio) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      const existingProject =
        await prisma.project.findFirst({
          where: {
            id: req.params.id,
            portfolioId:
              portfolio.id,
          },
        });

      if (!existingProject) {
        return res.status(404).json({
          error: "Project not found",
        });
      }

      await prisma.project.delete({
        where: {
          id: existingProject.id,
        },
      });

      return res
        .status(204)
        .end();
    } catch (error) {
      console.error(
        "DELETE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to delete project",
      });
    }
  }
);

/* =========================================================
   ANALYTICS EVENT VALIDATION
========================================================= */

const eventSchema =
  z.object({
    portfolioId:
      z.string(),

    projectId:
      z.string()
        .nullable()
        .optional(),

    eventType:
      z.enum([
        "PAGE_VIEW",
        "PROJECT_CLICK",
      ]),

    page:
      z.string()
        .default("/"),

    visitorId:
      z.string()
        .min(8)
        .max(100),

    sessionId:
      z.string()
        .min(8)
        .max(100),

    referrer:
      z.string()
        .nullable()
        .optional(),

    country:
      z.string()
        .nullable()
        .optional(),

    state:
      z.string()
        .nullable()
        .optional(),

    city:
      z.string()
        .nullable()
        .optional(),

    device:
      z.string()
        .nullable()
        .optional(),

    browser:
      z.string()
        .nullable()
        .optional(),

    operatingSystem:
      z.string()
        .nullable()
        .optional(),

    userAgent:
      z.string()
        .nullable()
        .optional(),
  });

/* =========================================================
   CREATE ANALYTICS EVENT
========================================================= */

app.post(
  "/api/analytics/events",
  async (req, res) => {
    const parsed =
      eventSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      console.error(
        "ANALYTICS VALIDATION ERROR:",
        parsed.error.issues
      );

      return res.status(400).json({
        error:
          "Invalid analytics event",
      });
    }

    try {
      const portfolio =
        await prisma.portfolio.findUnique({
          where: {
            id:
              parsed.data
                .portfolioId,
          },
        });

      if (!portfolio) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      await prisma.analyticsEvent.create(
        {
          data: {
            portfolioId:
              parsed.data
                .portfolioId,

            projectId:
              parsed.data
                .projectId || null,

            eventType:
              parsed.data
                .eventType,

            page:
              parsed.data.page,

            visitorId:
              parsed.data
                .visitorId,

            sessionId:
              parsed.data
                .sessionId,

            referrer:
              parsed.data
                .referrer || null,

            country:
              parsed.data.country ||
              "Unknown",

            state:
              parsed.data.state ||
              "Unknown",

            city:
              parsed.data.city ||
              "Unknown",

            device:
              parsed.data.device ||
              "Unknown",

            browser:
              parsed.data.browser ||
              "Other",

            operatingSystem:
              parsed.data
                .operatingSystem ||
              "Other",

            userAgent:
              parsed.data
                .userAgent || null,
          },
        }
      );

      return res.status(201).json({
        ok: true,
      });
    } catch (error) {
      console.error(
        "ANALYTICS EVENT ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to record analytics event",
      });
    }
  }
);

/* =========================================================
   ANALYTICS HELPERS
========================================================= */

async function getPort(
  userId: string
) {
  return prisma.portfolio.findUnique({
    where: {
      userId,
    },
  });
}

function getDateRange(
  query: any
) {
  const end =
    query.end
      ? new Date(
          String(query.end)
        )
      : new Date();

  const start =
    query.start
      ? new Date(
          String(query.start)
        )
      : new Date(
          end.getTime() -
            30 *
              86400000
        );

  end.setHours(
    23,
    59,
    59,
    999
  );

  start.setHours(
    0,
    0,
    0,
    0
  );

  return {
    gte: start,
    lte: end,
  };
}

/* =========================================================
   ANALYTICS OVERVIEW
========================================================= */

app.get(
  "/api/analytics/overview",
  auth,
  async (req, res) => {
    try {
      const portfolio =
        await getPort(
          req.userId!
        );

      if (!portfolio) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      const events =
        await prisma.analyticsEvent.findMany(
          {
            where: {
              portfolioId:
                portfolio.id,

              timestamp:
                getDateRange(
                  req.query
                ),
            },
          }
        );

      const views =
        events.filter(
          (event) =>
            event.eventType ===
            "PAGE_VIEW"
        );

      const clicks =
        events.filter(
          (event) =>
            event.eventType ===
            "PROJECT_CLICK"
        );

      const uniqueVisitors =
        new Set(
          views.map(
            (event) =>
              event.visitorId
          )
        ).size;

      const returningVisitors =
        Math.max(
          0,
          views.length -
            uniqueVisitors
        );

      return res.json({
        totalVisitors:
          views.length,

        uniqueVisitors,

        pageViews:
          views.length,

        projectClicks:
          clicks.length,

        returningVisitors,
      });
    } catch (error) {
      console.error(
        "ANALYTICS OVERVIEW ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load analytics",
      });
    }
  }
);

/* =========================================================
   ANALYTICS ALL
========================================================= */

app.get(
  "/api/analytics/all",
  auth,
  async (req, res) => {
    try {
      const portfolio =
        await getPort(
          req.userId!
        );

      if (!portfolio) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      const events =
        await prisma.analyticsEvent.findMany(
          {
            where: {
              portfolioId:
                portfolio.id,

              timestamp:
                getDateRange(
                  req.query
                ),
            },

            include: {
              project: true,
            },

            orderBy: {
              timestamp: "desc",
            },
          }
        );

      const views =
        events.filter(
          (event) =>
            event.eventType ===
            "PAGE_VIEW"
        );

      const clicks =
        events.filter(
          (event) =>
            event.eventType ===
            "PROJECT_CLICK"
        );

      const groupByField = (
        items: typeof events,
        field:
          | "referrer"
          | "device"
          | "browser"
          | "country"
      ) => {
        const counts: Record<
          string,
          number
        > = {};

        for (const item of items) {
          const value =
            item[field] ||
            "Unknown";

          counts[value] =
            (counts[value] || 0) +
            1;
        }

        return Object.entries(
          counts
        )
          .map(
            ([name, value]) => ({
              name,
              value,
            })
          )
          .sort(
            (a, b) =>
              b.value -
              a.value
          );
      };

      const dailyCounts: Record<
        string,
        number
      > = {};

      for (const event of views) {
        const date =
          event.timestamp
            .toISOString()
            .slice(0, 10);

        dailyCounts[date] =
          (dailyCounts[date] ||
            0) + 1;
      }

      const traffic =
        Object.entries(
          dailyCounts
        )
          .map(
            ([date, value]) => ({
              date,
              value,
            })
          )
          .sort(
            (a, b) =>
              a.date.localeCompare(
                b.date
              )
          );

      const projectCounts: Record<
        string,
        number
      > = {};

      for (const event of clicks) {
        const title =
          event.project
            ?.title ||
          "Unknown";

        projectCounts[title] =
          (projectCounts[title] ||
            0) + 1;
      }

      const projects =
        Object.entries(
          projectCounts
        )
          .map(
            ([name, value]) => ({
              name,
              value,
            })
          )
          .sort(
            (a, b) =>
              b.value -
              a.value
          );

      return res.json({
        traffic,

        sources:
          groupByField(
            views,
            "referrer"
          ),

        devices:
          groupByField(
            views,
            "device"
          ),

        browsers:
          groupByField(
            views,
            "browser"
          ),

        countries:
          groupByField(
            views,
            "country"
          ),

        projects,

        recent:
          events.slice(0, 20),
      });
    } catch (error) {
      console.error(
        "ANALYTICS ALL ERROR:",
        error
      );

      return res.status(500).json({
        error:
          "Unable to load analytics",
      });
    }
  }
);

/* =========================================================
   PDF REPORT
========================================================= */

app.get(
  "/api/reports/pdf",
  auth,
  async (req, res) => {
    try {
      const portfolio =
        await getPort(
          req.userId!
        );

      if (!portfolio) {
        return res.status(404).json({
          error:
            "Portfolio not found",
        });
      }

      const events =
        await prisma.analyticsEvent.findMany(
          {
            where: {
              portfolioId:
                portfolio.id,

              timestamp:
                getDateRange(
                  req.query
                ),
            },
          }
        );

      const views =
        events.filter(
          (event) =>
            event.eventType ===
            "PAGE_VIEW"
        );

      const clicks =
        events.filter(
          (event) =>
            event.eventType ===
            "PROJECT_CLICK"
        );

      const unique =
        new Set(
          views.map(
            (event) =>
              event.visitorId
          )
        ).size;

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${portfolio.slug}-analytics.pdf"`
      );

      const doc =
        new PDFDocument({
          margin: 50,
        });

      doc.pipe(res);

      doc
        .fontSize(24)
        .text(
          `${portfolio.name} — Analytics Report`
        );

      doc.moveDown();

      doc
        .fontSize(11)
        .text(
          `Reporting period: ${
            req.query.start ||
            "30 days ago"
          } to ${
            req.query.end ||
            "today"
          }`
        );

      doc
        .moveDown()
        .fontSize(16)
        .text(
          "Overview"
        );

      doc
        .fontSize(12)
        .text(
          `Total visitors: ${views.length}\n` +
            `Unique visitors: ${unique}\n` +
            `Page views: ${views.length}\n` +
            `Project clicks: ${clicks.length}`
        );

      const getCounts = (
        field:
          | "referrer"
          | "device"
          | "browser"
      ) => {
        const counts: Record<
          string,
          number
        > = {};

        for (const event of views) {
          const value =
            event[field] ||
            "Unknown";

          counts[value] =
            (counts[value] || 0) +
            1;
        }

        return Object.entries(
          counts
        )
          .sort(
            (a, b) =>
              b[1] - a[1]
          )
          .slice(0, 10);
      };

      doc
        .moveDown()
        .fontSize(16)
        .text(
          "Traffic sources"
        );

      doc
        .fontSize(11)
        .text(
          getCounts("referrer")
            .map(
              ([name, value]) =>
                `${name}: ${value}`
            )
            .join("\n") ||
            "No data"
        );

      doc
        .moveDown()
        .fontSize(16)
        .text(
          "Devices"
        );

      doc
        .fontSize(11)
        .text(
          getCounts("device")
            .map(
              ([name, value]) =>
                `${name}: ${value}`
            )
            .join("\n") ||
            "No data"
        );

      doc
        .moveDown()
        .fontSize(16)
        .text(
          "Browsers"
        );

      doc
        .fontSize(11)
        .text(
          getCounts("browser")
            .map(
              ([name, value]) =>
                `${name}: ${value}`
            )
            .join("\n") ||
            "No data"
        );

      doc.end();
    } catch (error) {
      console.error(
        "PDF REPORT ERROR:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          error:
            "Unable to generate report",
        });
      }
    }
  }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    err: any,
    _req,
    res,
    _next
  ) => {
    console.error(
      "GLOBAL ERROR:",
      err
    );

    return res.status(500).json({
      error:
        "Internal server error",
    });
  }
);

export default app;