/**
 * Types for the TOIK Strapi content model.
 *
 * Hand-written on purpose: Strapi's generated `contentTypes.d.ts` describes
 * the admin-side schema, not the shape the REST API returns after populate.
 * These describe what the front end actually receives.
 *
 * Keep in sync with src/api/*\/content-types/*\/schema.json in toik-cms.
 */

// --- Strapi envelope ---------------------------------------------------

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
  mime: string;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  mime: string;
  formats: Record<string, StrapiMediaFormat> | null;
}

/** Strapi's native rich-text field. Rendered by <RichText>. */
export interface BlockNode {
  type: string;
  children?: BlockNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  level?: number;
  format?: 'ordered' | 'unordered';
  image?: StrapiMedia;
}

// --- Content types -----------------------------------------------------

export type ArticleSection = 'klubb' | 'elite' | 'bredde';
export type ArticleCategory = 'nyhet' | 'kampreferat' | 'vikings' | 'bredde';

export interface Article extends StrapiEntity {
  title: string;
  slug: string;
  publishDate: string;
  excerpt: string;
  cover: StrapiMedia | null;
  body: BlockNode[];
  section: ArticleSection;
  category: ArticleCategory;
  team?: Team | null;
}

export type TeamCategory = 'hockeyskole' | 'yngres' | 'senior' | 'trim';

export interface Team extends StrapiEntity {
  name: string;
  slug: string;
  level: string | null;
  description: BlockNode[] | null;
  photo: StrapiMedia | null;
  /** Federation IDs — the board maintains these in the admin each season. */
  tournamentId: string | null;
  teamId: string | null;
  category?: TeamCategory;
  birthYear?: number | null;
  active?: boolean;
  sortOrder: number;
  players?: Player[];
  articles?: Article[];
}

export type SponsorTier = 'hoved' | 'partner' | 'stotte';

export interface Sponsor extends StrapiEntity {
  name: string;
  logo: StrapiMedia | null;
  url: string | null;
  tier: SponsorTier;
  activeFrom: string | null;
  activeTo: string | null;
  sortOrder: number;
}

export interface Player extends StrapiEntity {
  name: string;
  number: number | null;
  position: 'malvakt' | 'back' | 'center' | 'ving' | 'forward' | null;
  shoots: 'venstre' | 'hoyre' | null;
  birthYear: number | null;
  photo: StrapiMedia | null;
  bio: string | null;
  team?: Team | null;
  active: boolean;
  sortOrder: number;
}

export interface Person extends StrapiEntity {
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  photo: StrapiMedia | null;
  group: 'styre' | 'sportslig' | 'administrasjon';
}

export interface Page extends StrapiEntity {
  title: string;
  slug: string;
  body: BlockNode[];
  parent?: Pick<Page, 'id' | 'documentId' | 'title' | 'slug'> | null;
  children?: Array<Pick<Page, 'id' | 'documentId' | 'title' | 'slug'>>;
  sortOrder?: number;
  showInMenu?: boolean;
}

// --- Single types ------------------------------------------------------

export interface SectionToggle {
  sectionId: string;
  title: string;
  enabled: boolean | null;
  image: StrapiMedia | null;
  content: unknown[];
}

export interface HeroBanner {
  title: string;
  subtitle: string | null;
  image: StrapiMedia | null;
  ctaText: string | null;
  ctaLink: string | null;
}

export interface Frontpage extends StrapiEntity {
  title: string;
  hero: HeroBanner | null;
  pinnedArticle: Article | null;
  featuredSponsorTier: SponsorTier | null;
  sections: SectionToggle[];
}

export interface Club extends StrapiEntity {
  logo: StrapiMedia | null;
  socialLinks: components["schemas"]["SharedSocialLinkEntry"][];
  grasrotandelenOrgNumber: string | null;
}

// --- Custom match endpoints --------------------------------------------

export type MatchSide = 'home' | 'away';

export interface Fixture {
  id: number;
  date: string;
  time: string | null;
  kickoff: string;
  homeTeam: string | null;
  awayTeam: string | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  venue: string | null;
  round: string | null;
  tournament: string | null;
  result: string | null;
  isHome: boolean;
  outcome: 'win' | 'loss' | 'draw' | null;
}

export interface FixtureResponse {
  data: Fixture[];
  meta: {
    type: 'upcoming' | 'completed';
    team: string | null;
    tournamentId: string;
    teamId: string;
    count: number;
  };
}

export interface SideCount {
  home: number;
  away: number;
}

export interface TimelineGoal {
  type: 'goal';
  team: MatchSide;
  scorer: string | null;
  assists: string[];
  /** "PP1", "Empty net", "Game Winning Goal", "Even strength" */
  flags: string[];
  period: number | null;
  /** Wall-clock seconds within the period — ordering only, NOT a game clock. */
  time: number | null;
  score: SideCount;
}

export interface TimelinePenalty {
  type: 'penalty';
  team: MatchSide;
  player: string | null;
  minutes: number;
  reason: string | null;
  period: number | null;
  time: number | null;
  score: SideCount;
}

export type TimelineEvent = TimelineGoal | TimelinePenalty;

export interface LiveMatch {
  active: boolean;
  source: 'active' | 'explicit';
  arena: string;
  match: {
    id: number;
    date: string | null;
    time: string | null;
    homeTeam: string | null;
    awayTeam: string | null;
    homeTeamId: number | null;
    awayTeamId: number | null;
    venue: string | null;
    tournament: string | null;
  } | null;
  score: SideCount | null;
  shots: SideCount | null;
  penalties: SideCount | null;
  penaltyMinutes: SideCount | null;
  faceoffs: (SideCount & { total: number; homePct: number | null }) | null;
  periods: Array<{ period: number; goals: SideCount; shots: SideCount }>;
  timeline: TimelineEvent[];
  incidentCount: number;
}
