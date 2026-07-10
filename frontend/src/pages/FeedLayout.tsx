import React, { useState } from 'react';
import { useGetPublicBlogsQuery, useGetTrendingBlogsQuery, useGetTopBlogsQuery, useGetStaffPicksQuery, useGetPlatformStatsQuery, useGetMyBookmarkedBlogIdsQuery } from '../store/api/blogApi';
import { BlogCard } from '../components/feed/BlogCard';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Tabs, Panel } from '../components/tui/Primitives';

type FeedTab = 'Latest' | 'Top';

export const FeedLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>('Latest');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { data: latestData, isLoading: latestLoading, error: latestError } = useGetPublicBlogsQuery(
    { page: 0, size: 20, category: activeCategory || undefined }, 
    { refetchOnMountOrArgChange: true }
  );
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useGetTrendingBlogsQuery(
    { page: 0, size: 20, category: activeCategory || undefined }, 
    { refetchOnMountOrArgChange: true }
  );
  const { data: topData, isLoading: topLoading, error: topError } = useGetTopBlogsQuery(
    { page: 0, size: 20, category: activeCategory || undefined }, 
    { refetchOnMountOrArgChange: true }
  );
  const { data: staffPicksData } = useGetStaffPicksQuery({ page: 0, size: 5 }, { refetchOnMountOrArgChange: true });
  const { data: statsData } = useGetPlatformStatsQuery();
  
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { data: bookmarkedIds } = useGetMyBookmarkedBlogIdsQuery(undefined, { skip: !isAuthenticated });

  const activeData = activeTab === 'Latest' ? latestData : topData;
  const activeLoading = activeTab === 'Latest' ? latestLoading : topLoading;
  const activeError = activeTab === 'Latest' ? latestError : topError;

  return (
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 font-mono text-sm [--tw-accent:theme(colors.accent)]">
      
      {/* Left Column - Navigation / Stats */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24">
          <div className="mb-6">
            <h3 className="text-secondary uppercase tracking-widest text-xs font-bold mb-4">Platform Stats</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-fg">{statsData ? statsData.activeUsers.toLocaleString() : '...'}</span>
              <span className="text-secondary text-xs uppercase tracking-widest">Users</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold text-fg">{statsData ? statsData.publishedBlogs.toLocaleString() : '...'}</span>
              <span className="text-secondary text-xs uppercase tracking-widest">Blogs</span>
            </div>
          </div>

          <div className="tui-divider"></div>

          <div>
            <h3 className="text-secondary uppercase tracking-widest text-xs font-bold mb-4 flex justify-between items-center">
              <span>Topics</span>
              {activeCategory && (
                <button 
                  onClick={() => setActiveCategory(null)}
                  className="text-xs text-accent hover:text-fg font-normal"
                >
                  Clear
                </button>
              )}
            </h3>
            <ul className="space-y-3 text-fg font-bold">
              {['Technology', 'AI', 'Engineering', 'Software Engineering', 'Business blogs', 'Finance', 'Productivity', 'Design', 'Art and design blogs', 'News blogs', 'Food blogs', 'Travel blogs', 'Health and fitness blogs', 'Lifestyle blogs', 'Sports blogs'].map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => setActiveCategory(cat)}
                    className={`transition-colors text-left w-full ${activeCategory === cat ? 'text-accent' : 'hover:text-accent'}`}
                  >
                    {activeCategory === cat ? '▸ ' : ''}{cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Middle Column - Main Feed */}
      <main className="col-span-1 lg:col-span-6">
        <Tabs 
          tabs={['Latest', 'Top']} 
          activeTab={activeTab} 
          onTabChange={(tab: FeedTab) => setActiveTab(tab)} 
        />

        <div>
          {activeLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="border-b border-border pb-6 mb-6">
                  <div className="w-1/4 h-3 bg-border mb-3" />
                  <div className="w-full h-4 bg-border mb-2" />
                  <div className="w-3/4 h-4 bg-border mb-4" />
                  <div className="w-full h-3 bg-bg border border-border mb-2" />
                  <div className="w-2/3 h-3 bg-bg border border-border" />
                </div>
              ))}
            </div>
          ) : activeError ? (
            <div className="text-danger text-sm py-10 text-center uppercase tracking-widest">Failed to load public feed.</div>
          ) : activeData?.content && activeData.content.length > 0 ? (
            activeData.content.map(blog => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                slug={blog.slug}
                title={blog.title}
                description={blog.seoDescription || "No description provided."}
                views={blog.viewCount || 0}
                tags={blog.tags || []}
                author={blog.authorUsername || blog.authorEmail?.split('@')[0] || "Unknown Author"}
                date={blog.createdAt}
                initialBookmarked={bookmarkedIds?.includes(blog.id) || false}
                isStaffPick={blog.isStaffPick}
              />
            ))
          ) : (
            <div className="text-center py-20 text-secondary text-sm uppercase tracking-widest">
              No published articles yet.
            </div>
          )}
        </div>
      </main>

      {/* Right Column - Discovery Widgets */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24 space-y-8">
          
          <Panel title="Trending Now">
            <ul className="space-y-4">
              {trendingData?.content.slice(0, 3).map((blog, idx) => (
                <li key={blog.id} className="group cursor-pointer">
                  <span className="text-xs font-bold text-secondary mb-1 block">0{idx + 1}</span>
                  <Link to={`/blog/${blog.slug}`}>
                    <h4 className="text-sm font-bold text-fg leading-tight group-hover:text-accent transition-colors line-clamp-2">{blog.title}</h4>
                  </Link>
                  <p className="text-xs text-secondary mt-1 tracking-widest uppercase">{blog.authorUsername || blog.authorEmail?.split('@')[0]}</p>
                </li>
              ))}
              {!trendingData?.content?.length && (
                <li className="text-sm text-secondary uppercase tracking-widest text-xs">No trending blogs yet.</li>
              )}
            </ul>
          </Panel>

          <Panel title="Staff Picks">
            <ul className="space-y-4">
              {staffPicksData?.content.map((blog) => (
                <li key={blog.id} className="group cursor-pointer">
                  <Link to={`/blog/${blog.slug}`}>
                    <h4 className="text-sm font-bold text-fg leading-tight group-hover:text-accent transition-colors line-clamp-2">{blog.title}</h4>
                  </Link>
                  <p className="text-xs text-secondary mt-1 tracking-widest uppercase">{blog.authorUsername || blog.authorEmail?.split('@')[0]}</p>
                </li>
              ))}
              {!staffPicksData?.content?.length && (
                <li className="text-sm text-secondary uppercase tracking-widest text-xs">No staff picks yet.</li>
              )}
            </ul>
          </Panel>

        </div>
      </aside>

    </div>
  );
};
