import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useArticles, ArticleStatus, Theme, Strategy } from '../contexts/ArticleContext';
import { Search, Plus, Filter, LogOut, FileText, Edit3, CheckCircle2, Send, Globe, Settings } from 'lucide-react';

interface Props {
  onCreateNew: () => void;
  onEditArticle: (id: string) => void;
  onOpenAdmin: () => void;
}

export function EnhancedDashboard({ onCreateNew, onEditArticle, onOpenAdmin }: Props) {
  const { user, logout } = useAuth();
  const { articles } = useArticles();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ArticleStatus | 'all'>('all');
  const [filterTheme, setFilterTheme] = useState<Theme | 'all'>('all');
  const [filterStrategy, setFilterStrategy] = useState<Strategy | 'all'>('all');

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.coreMessage.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
      const matchesTheme = filterTheme === 'all' || (article.themes || []).includes(filterTheme);
      const matchesStrategy = filterStrategy === 'all' || (article.strategies || []).includes(filterStrategy);

      return matchesSearch && matchesStatus && matchesTheme && matchesStrategy;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [articles, searchQuery, filterStatus, filterTheme, filterStrategy]);

  const statusCounts = useMemo(() => {
    return {
      idea: articles.filter(a => a.status === 'idea').length,
      drafting: articles.filter(a => a.status === 'drafting').length,
      finished: articles.filter(a => a.status === 'finished').length,
      submitted: articles.filter(a => a.status === 'submitted').length,
      published: articles.filter(a => a.status === 'published').length,
    };
  }, [articles]);

  const getStatusIcon = (status: ArticleStatus) => {
    switch (status) {
      case 'idea': return <FileText className="w-4 h-4" />;
      case 'drafting': return <Edit3 className="w-4 h-4" />;
      case 'finished': return <CheckCircle2 className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'published': return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ArticleStatus) => {
    switch (status) {
      case 'idea': return 'bg-gray-100 text-gray-700';
      case 'drafting': return 'bg-blue-100 text-blue-700';
      case 'finished': return 'bg-green-100 text-green-700';
      case 'submitted': return 'bg-purple-100 text-purple-700';
      case 'published': return 'bg-indigo-100 text-indigo-700';
    }
  };

  const getStatusLabel = (status: ArticleStatus) => {
    switch (status) {
      case 'idea': return 'Idé';
      case 'drafting': return 'Under arbeid';
      case 'finished': return 'Ferdig';
      case 'submitted': return 'Sendt inn';
      case 'published': return 'Publisert';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl" style={{ fontWeight: 700 }}>Plenor</h1>
              <p className="text-sm text-gray-600">Velkommen tilbake, {user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logg ut
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Ideer</span>
            </div>
            <div className="text-2xl" style={{ fontWeight: 700 }}>{statusCounts.idea}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Edit3 className="w-4 h-4" />
              <span className="text-sm">Under arbeid</span>
            </div>
            <div className="text-2xl" style={{ fontWeight: 700 }}>{statusCounts.drafting}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Ferdig</span>
            </div>
            <div className="text-2xl" style={{ fontWeight: 700 }}>{statusCounts.finished}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Send className="w-4 h-4" />
              <span className="text-sm">Sendt inn</span>
            </div>
            <div className="text-2xl" style={{ fontWeight: 700 }}>{statusCounts.submitted}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Publisert</span>
            </div>
            <div className="text-2xl" style={{ fontWeight: 700 }}>{statusCounts.published}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Søk i artikler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ny artikkel
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ArticleStatus | 'all')}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle statuser</option>
              <option value="idea">Idé</option>
              <option value="drafting">Under arbeid</option>
              <option value="finished">Ferdig</option>
              <option value="submitted">Sendt inn</option>
              <option value="published">Publisert</option>
            </select>

            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value as Theme | 'all')}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle temaer</option>
              <option value="housing">Housing</option>
              <option value="school">School</option>
              <option value="transport">Transport</option>
              <option value="healthcare">Healthcare</option>
              <option value="environment">Environment</option>
              <option value="economy">Economy</option>
              <option value="culture">Culture</option>
              <option value="labor">Labor</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value as Strategy | 'all')}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle strategier</option>
              <option value="progressive">Progressiv</option>
              <option value="moderate">Moderat</option>
              <option value="heavy-left">Venstreradikal</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                {articles.length === 0 ? 'Ingen artikler ennå' : 'Ingen artikler matcher dine filtre'}
              </p>
              <button
                onClick={onCreateNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Opprett første artikkel
              </button>
            </div>
          ) : (
            filteredArticles.map(article => (
              <div
                key={article.id}
                onClick={() => onEditArticle(article.id)}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg mb-1" style={{ fontWeight: 700 }}>{article.title || 'Uten tittel'}</h3>
                    {article.subtitle && (
                      <p className="text-sm text-gray-600 mb-2">{article.subtitle}</p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2">{article.coreMessage}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {article.successScore !== undefined && article.successScore > 0 && (
                      <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm" style={{ fontWeight: 600 }}>
                        {article.successScore}/100
                      </div>
                    )}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${getStatusColor(article.status)}`}>
                      {getStatusIcon(article.status)}
                      {getStatusLabel(article.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  {article.themes && article.themes.length > 0 && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {article.themes[0].charAt(0).toUpperCase() + article.themes[0].slice(1)}
                      {article.themes.length > 1 && ` +${article.themes.length - 1}`}
                    </span>
                  )}
                  {article.strategies && article.strategies.length > 0 && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {article.strategies[0] === 'progressive' ? 'Progressiv' :
                       article.strategies[0] === 'moderate' ? 'Moderat' : 'Venstreradikal'}
                      {article.strategies.length > 1 && ` +${article.strategies.length - 1}`}
                    </span>
                  )}
                  {article.targetKrets && article.targetKrets.length > 0 && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      {article.targetKrets.length} krets{article.targetKrets.length > 1 ? 'er' : ''}
                    </span>
                  )}
                  {article.publishedIn && (
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
                      {article.publishedIn}
                    </span>
                  )}
                  <span className="ml-auto text-gray-400">
                    {new Date(article.updatedAt).toLocaleDateString('nb-NO')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
