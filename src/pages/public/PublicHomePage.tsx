import React, { useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AcademicCapIcon, UsersIcon, BuildingOfficeIcon, InstagramIcon, YouTubeIcon, FacebookIcon } from '@/components/Icons';
import { NewsItem, User } from '@/types';
import { formatDateForNews } from '@/utils';
import EditableContent from '@/components/EditableContent';

const { Link } = ReactRouterDOM as any;

/* ─── Feature Card ─── */
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  delay?: string;
}> = ({ icon, title, description, link, delay = '0s' }) => (
  <Link
    to={link}
    className="public-feature-card group block"
    style={{ animationDelay: delay }}
  >
    {/* Icon */}
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
      style={{
        background: 'rgba(201,168,76,0.1)',
        border: '1px solid rgba(201,168,76,0.25)',
        color: 'var(--gold)',
      }}
    >
      {icon}
    </div>

    {/* Text */}
    <h3
      className="text-lg font-semibold mb-2"
      style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
    >
      {title}
    </h3>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
      {description}
    </p>

    {/* Arrow */}
    <div
      className="mt-4 text-sm font-semibold flex items-center gap-1 transition-gap duration-200"
      style={{ color: 'var(--gold)' }}
    >
      Learn More
      <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
    </div>
  </Link>
);

/* ─── News Card ─── */
const NewsCard: React.FC<{ item: NewsItem }> = ({ item }) => (
  <div className="news-card flex flex-col">
    {item.imageUrls && item.imageUrls.length > 0 && (
      <div className="overflow-hidden" style={{ height: '180px' }}>
        <img
          src={item.imageUrls[0]}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
    )}
    <div className="p-6 flex flex-col flex-grow">
      <span className="section-label mb-2">{formatDateForNews(item.date)}</span>
      <h3
        className="text-lg font-bold leading-snug mb-3"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        {item.title}
      </h3>
      <p className="text-sm leading-relaxed flex-grow" style={{ color: 'var(--text-secondary)' }}>
        {item.content.substring(0, 160)}{item.content.length > 160 ? '…' : ''}
      </p>
      <Link
        to="/news"
        className="mt-4 text-sm font-semibold self-start flex items-center gap-1 hover:gap-2 transition-all duration-200"
        style={{ color: 'var(--gold)' }}
      >
        Read More →
      </Link>
    </div>
  </div>
);

/* ─── Stat Chip ─── */
const StatChip: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div
      className="text-3xl font-black"
      style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}
    >
      {value}
    </div>
    <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
      {label}
    </div>
  </div>
);

/* ─── Main Component ─── */
interface PublicHomePageProps {
  news: NewsItem[];
  user: User | null;
}

const PublicHomePage: React.FC<PublicHomePageProps> = ({ news, user }) => {
  const latestNews = useMemo(
    () => [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    [news]
  );

  // Remove any leftover body background from other pages
  useEffect(() => {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundAttachment = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundColor = 'var(--bg-base)';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  return (
    <>
      {/* ── ADMISSION BANNER ── */}
      <Link
        to="/admissions/online"
        className="admission-banner fixed bottom-0 left-0 right-0 z-50 block py-3 text-center text-base tracking-widest uppercase shadow-2xl"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        ✦ Admission Open — Apply Now ✦
      </Link>

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{
          minHeight: 'calc(100vh - 80px)',
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 65%),
            var(--bg-void)
          `,
        }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top-left corner accent */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: '40vw',
            height: '40vw',
            background: 'radial-gradient(circle at 0% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="section-label mb-6 animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
            Champhai, Mizoram · Est. Since Faith
          </div>

          {/* School name */}
          <h1
            className="font-black leading-none mb-4 animate-fade-in"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.8rem, 7vw, 6rem)',
              color: 'var(--text-primary)',
              animationDelay: '0.25s',
              opacity: 0,
            }}
          >
            <EditableContent
              id="home_hero_title"
              defaultContent="Bethel Mission School"
              type="text"
              user={user}
            />
          </h1>

          {/* Gold rule */}
          <div
            className="mx-auto my-6 animate-fade-in"
            style={{
              width: '80px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
              animationDelay: '0.4s',
              opacity: 0,
            }}
          />

          {/* Tagline */}
          <p
            className="italic text-xl md:text-2xl animate-fade-in"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--text-secondary)',
              animationDelay: '0.5s',
              opacity: 0,
            }}
          >
            <EditableContent
              id="home_hero_subtitle"
              defaultContent="Service to God &amp; Men"
              type="text"
              user={user}
            />
          </p>

          {/* CTA buttons */}
          <div
            className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in"
            style={{ animationDelay: '0.65s', opacity: 0 }}
          >
            <Link to="/admissions/online" className="btn btn-primary px-8 py-3 text-sm">
              Apply for Admission
            </Link>
            <Link
              to="/about"
              className="btn btn-secondary px-8 py-3 text-sm"
              style={{ borderColor: 'var(--border-mid)' }}
            >
              About the School
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in"
            style={{
              animationDelay: '0.8s',
              opacity: 0,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '2rem',
            }}
          >
            <StatChip value="15+" label="Years" />
            <StatChip value="100%" label="Dedication" />
            <StatChip value="∞" label="Legacy" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          LATEST NEWS
      ════════════════════════════════════════ */}
      <section
        className="py-24"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <div className="section-label mb-3">What's Happening</div>
              <h2 className="section-heading">Latest News &amp; Announcements</h2>
            </div>
            {news.length > 3 && (
              <Link
                to="/news"
                className="text-sm font-semibold self-start md:self-auto"
                style={{ color: 'var(--gold)' }}
              >
                View All →
              </Link>
            )}
          </div>

          {/* Cards */}
          {latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-16 rounded-xl"
              style={{ border: '1px dashed var(--border-subtle)' }}
            >
              <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
                No announcements yet
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                Check back soon for updates.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════ */}
      <section
        className="py-24"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 100%, rgba(201,168,76,0.05) 0%, transparent 70%),
            var(--bg-base)
          `,
        }}
      >
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="section-label mb-3">Our Promise</div>
            <h2 className="section-heading">
              <EditableContent
                id="home_choose_title"
                defaultContent="Why Choose Bethel?"
                type="text"
                user={user}
              />
            </h2>
            <div className="gold-rule mt-5 mb-6" />
            <p
              className="max-w-2xl mx-auto section-subtext"
            >
              <EditableContent
                id="home_choose_desc"
                defaultContent="At Bethel Mission School, we are dedicated to providing a nurturing yet challenging educational environment that fosters academic excellence, strong moral character, and a lifelong passion for learning."
                type="textarea"
                user={user}
              />
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<AcademicCapIcon className="w-6 h-6" />}
              title="Academic Excellence"
              description="A comprehensive curriculum that challenges students and promotes critical thinking, preparing them for future success."
              link="/academics"
              delay="0s"
            />
            <FeatureCard
              icon={<UsersIcon className="w-6 h-6" />}
              title="Holistic Development"
              description="Emphasis on extracurricular activities, sports, and arts to ensure the all-round development of every child."
              link="/student-life"
              delay="0.1s"
            />
            <FeatureCard
              icon={<BuildingOfficeIcon className="w-6 h-6" />}
              title="Modern Facilities"
              description="State-of-the-art classrooms, labs, and library to provide a conducive environment for learning and growth."
              link="/facilities"
              delay="0.2s"
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CONNECT WITH US
      ════════════════════════════════════════ */}
      <section
        className="py-24"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="section-label mb-3">Stay Connected</div>
            <h2 className="section-heading">Connect With Us</h2>
            <div className="gold-rule mt-5 mb-6" />
            <p className="max-w-xl mx-auto section-subtext">
              Follow us on social media to stay updated with our latest news, events, and student achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
            {/* Social links card */}
            <div
              className="rounded-xl p-8"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-widest mb-6"
                style={{ color: 'var(--gold)' }}
              >
                Find Us On
              </h3>

              <a
                href="https://www.facebook.com/bethel.ms"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-row"
              >
                <FacebookIcon className="w-7 h-7 flex-shrink-0" style={{ color: '#1877F2' }} />
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Facebook</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>@bethel.ms</div>
                </div>
              </a>

              <a
                href="https://www.instagram.com/bms_champhai/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-row"
              >
                <InstagramIcon className="w-7 h-7 flex-shrink-0" />
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Instagram</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>@bms_champhai</div>
                </div>
              </a>

              <a
                href="https://www.youtube.com/@BethelMissionSchoolChamphai"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-row"
              >
                <YouTubeIcon className="w-7 h-7 flex-shrink-0" style={{ color: '#FF0000' }} />
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>YouTube</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>@BethelMissionSchoolChamphai</div>
                </div>
              </a>
            </div>

            {/* Facebook embed */}
            <div
              className="rounded-xl p-4 flex justify-center overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                className="fb-page"
                data-href="https://www.facebook.com/bethel.ms"
                data-tabs="timeline"
                data-width="320"
                data-height="400"
                data-small-header="true"
                data-adapt-container-width="true"
                data-hide-cover="false"
                data-show-facepile="false"
              >
                <blockquote
                  cite="https://www.facebook.com/bethel.ms"
                  className="fb-xfbml-parse-ignore"
                >
                  <a href="https://www.facebook.com/bethel.ms">Bethel Mission School, Champhai</a>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom padding so admission banner doesn't overlap ── */}
      <div style={{ height: '56px' }} />
    </>
  );
};

export default PublicHomePage;
