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

export type TeamCategory = 'hockeyskole' | 'junior' | 'senior' | 'trim';

export interface Team extends StrapiEntity {
  name: string;
  slug: string;
  level: string | null;
  description: BlockNode[] | null;
  photo: StrapiMedia | null;
  /** Federation IDs — the board maintains these in the admin each season. */
  tournamentId: string | null;
  teamId: string | null;
  /** Strapi team ID used by /api/matches to fetch fixtures for this team. */
  fixtureTeamId: string | null;
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
  slug: string;
  number: number | null;
  position: 'malvakt' | 'back' | 'center' | 'ving' | 'forward' | null;
  shoots: 'venstre' | 'hoyre' | null;
  birthYear: number | null;
  photo: StrapiMedia | null;
  team?: Team | null;
  active: boolean;
  sortOrder: number;
  socialLinks?: Array<{
    id: number;
    documentId: string;
    platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok';
    url: string;
    icon?: StrapiMedia | null;
  }>;
  about?: BlockNode[];
}

export interface Person extends StrapiEntity {
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  photo: StrapiMedia | null;
  bio: string | null;
}


/** A link entry inside a footer group — either a page relation or manual URL. */
export interface FooterGroupLink {
  id: number;
  documentId: string;
  label: string;
  url: string | null;
  page?: Pick<{ id: number; documentId: string; title: string; slug: string }, 'id' | 'documentId' | 'title' | 'slug'> | null;
}

/** A named column group in the footer. */
export interface FooterLinkGroup extends StrapiEntity {
  title: string;
  links: FooterGroupLink[];
}

export interface Page extends StrapiEntity {
  title: string;
  slug: string;
  content: BlockNode[] | null;
  parent?: Pick<Page, 'id' | 'slug' | 'title'> | null;
  children?: Array<Pick<Page, 'id' | 'slug' | 'title'>>;
  sortOrder: number;
  showInMenu: boolean;
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
  name: string;
  slogan: string | null;
  logo: StrapiMedia | null;
  socialLinks: components["schemas"]["SharedSocialLinkEntry"][];
  footerLogo: StrapiMedia | null;
  footerLinkGroups: FooterLinkGroup[] | null;
  grasrotandelenOrgNumber: string | null;
}

export interface Contact extends StrapiEntity {
  title: string;
  address: string;
  orgNumber: string | null;
  email: string;
  phone: string | null;
  mapCoordinates: components["schemas"]["SharedMapCoordinatesEntry"] | null;
  contactPersons: Person[];
}

export interface Whistleblow extends StrapiEntity {
  title: string;
  content: BlockNode[];
  recipients: 'alle' | 'spillere' | 'foreldre' | 'trenere' | 'styre';
  isActive: boolean | null;
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

export interface LiveMatch {
  active: boolean;
  phase: 'pre-game' | 'live' | 'post-game' | 'none';
  arena: string;
  match: {
    id: number;
    homeTeam: string | null;
    awayTeam: string | null;
    venue: string | null;
    tournament: string | null;
    date: string | null;
    time: string | null;
  } | null;
  score: { home: number; away: number } | null;
  countdownSec: number | null;
  hockeyLiveUrl: string | null;
}
