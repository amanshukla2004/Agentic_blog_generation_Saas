import React, { useState } from 'react';
import { useGetPublicBlogsQuery, useGetTrendingBlogsQuery, useGetPlatformStatsQuery, useGetMyBookmarkedBlogIdsQuery } from '../store/api/blogApi';
import { BlogCard } from '../components/feed/BlogCard';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

type FeedTab = 'Latest' | 'Top' | 'Relevant';

export const FeedLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>('Latest');
  
  const { data: latestData, isLoading: latestLoading, error: latestError } = useGetPublicBlogsQuery({ page: 0, size: 20 });
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useGetTrendingBlogsQuery({ page: 0, size: 20 });
  const { data: statsData } = useGetPlatformStatsQuery();
  
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { data: bookmarkedIds } = useGetMyBookmarkedBlogIdsQuery(undefined, { skip: !isAuthenticated });

  const activeData = activeTab === 'Latest' ? latestData : trendingData;
  const activeLoading = activeTab === 'Latest' ? latestLoading : trendingLoading;
  const activeError = activeTab === 'Latest' ? latestError : trendingError;

  return (
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
      
      {/* Left Column - Navigation / Stats */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24">
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Platform Stats</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-zinc-900">{statsData ? statsData.activeUsers.toLocaleString() : '...'}</span>
              <span className="text-sm font-medium text-zinc-500">Active Users</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold text-zinc-900">{statsData ? statsData.publishedBlogs.toLocaleString() : '...'}</span>
              <span className="text-sm font-medium text-zinc-500">Published Blogs</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Topics</h3>
            <ul className="space-y-3 text-sm text-zinc-600 font-medium">
              <li><button className="hover:text-zinc-900 transition-colors">Technology</button></li>
              <li><button className="hover:text-zinc-900 transition-colors">Artificial Intelligence</button></li>
              <li><button className="hover:text-zinc-900 transition-colors">Software Engineering</button></li>
              <li><button className="hover:text-zinc-900 transition-colors">Productivity</button></li>
              <li><button className="hover:text-zinc-900 transition-colors">Design</button></li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Middle Column - Main Feed */}
      <main className="col-span-1 lg:col-span-6">
        <div className="border-b border-zinc-200 mb-6 flex gap-6">
          {(['Latest', 'Top', 'Relevant'] as FeedTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'border-b-2 border-zinc-900 text-zinc-900' 
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div>
          {activeLoading ? (
            <div className="space-y-8 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="border-b border-zinc-100 pb-6 mb-6">
                  <div className="w-1/4 h-3 bg-zinc-200 rounded mb-3" />
                  <div className="w-full h-6 bg-zinc-200 rounded mb-2" />
                  <div className="w-3/4 h-6 bg-zinc-200 rounded mb-4" />
                  <div className="w-full h-4 bg-zinc-100 rounded mb-2" />
                  <div className="w-2/3 h-4 bg-zinc-100 rounded" />
                </div>
              ))}
            </div>
          ) : activeError ? (
            <div className="text-red-600 text-sm font-medium py-10 text-center">Failed to load public feed.</div>
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
                date={new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                initialBookmarked={bookmarkedIds?.includes(blog.id) || false}
              />
            ))
          ) : (
            <div className="text-center py-20 text-zinc-500 text-sm font-medium">
              No published articles yet.
            </div>
          )}
        </div>
      </main>

      {/* Right Column - Discovery Widgets */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24 space-y-10">
          
          <div>
            <h3 className="text-sm font-bold text-zinc-900 mb-4">Trending Now</h3>
            <ul className="space-y-4">
              {trendingData?.content.slice(0, 3).map((blog, idx) => (
                <li key={blog.id} className="group cursor-pointer">
                  <span className="text-xs font-semibold text-zinc-400 mb-1 block">0{idx + 1}</span>
                  <Link to={`/blog/${blog.slug}`}>
                    <h4 className="text-sm font-bold text-zinc-900 leading-tight group-hover:text-zinc-600 transition-colors line-clamp-2">{blog.title}</h4>
                  </Link>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">{blog.authorUsername || blog.authorEmail?.split('@')[0]}</p>
                </li>
              ))}
              {!trendingData?.content?.length && (
                <li className="text-sm text-zinc-500">No trending blogs yet.</li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-900 mb-4">Staff Picks</h3>
            <ul className="space-y-4">
              <li className="group cursor-pointer">
                <h4 className="text-sm font-bold text-zinc-900 leading-tight group-hover:text-zinc-600 transition-colors">Building a Design System from Scratch</h4>
                <p className="text-xs text-zinc-500 mt-1 font-medium">Diana Mounter</p>
              </li>
              <li className="group cursor-pointer">
                <h4 className="text-sm font-bold text-zinc-900 leading-tight group-hover:text-zinc-600 transition-colors">Optimizing Core Web Vitals in 2026</h4>
                <p className="text-xs text-zinc-500 mt-1 font-medium">Addy Osmani</p>
              </li>
            </ul>
          </div>

        </div>
      </aside>

    </div>
  );
};
