import React, { useState, useEffect, useMemo } from 'react';
import { useArticles, Article, Theme, Strategy } from '../contexts/ArticleContext';
import { useAuth } from '../contexts/AuthContext';
import { useKrets } from '../contexts/KretsContext';
import { RichTextEditor } from './RichTextEditor';
import { calculateSuccessScore, getSuccessScoreColor, getSuccessScoreFeedback } from '../utils/scoring';
import {
  ArrowLeft, Save, Eye, Edit, Target, Lightbulb, Trash2, Upload,
  User, MapPin, Briefcase, MessageSquare, TrendingUp, FileText
} from 'lucide-react';
import { projectId } from '/utils/supabase/info';

interface Props {
  articleId?: string;
  onBack: () => void;
}

export function EnhancedArticleEditor({ articleId, onBack }: Props) {
  const { articles, addArticle, updateArticle, deleteArticle, addComment } = useArticles();
  const { user, accessToken } = useAuth();
  const { counties } = useKrets();
  const [isPreview, setIsPreview] = useState(false);
  const [showPlanning, setShowPlanning] = useState(true);
  const [commentText, setCommentText] = useState('');

  const existingArticle = articleId ? articles.find(a => a.id === articleId) : undefined;

  const [formData, setFormData] = useState<Omit<Article, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'collaborators' | 'comments'>>({
    title: '',
    subtitle: '',
    body: '',
    coverImage: undefined,
    status: 'idea',
    themes: [],
    targetKrets: [],
    strategies: [],
    problem: '',
    direction: '',
    targetGroup: '',
    coreMessage: '',
    hook: '',
    opponent: '',
    goal: '',
    tags: [],
    author: {
      name: user?.name || '',
      location: undefined,
      title: undefined
    },
    publishedAt: undefined,
    publishedIn: undefined,
    successScore: undefined
  });

  useEffect(() => {
    if (existingArticle) {
      setFormData({
        title: existingArticle.title,
        subtitle: existingArticle.subtitle,
        body: existingArticle.body,
        coverImage: existingArticle.coverImage,
        status: existingArticle.status,
        themes: existingArticle.themes || [],
        targetKrets: existingArticle.targetKrets || [],
        strategies: existingArticle.strategies || [],
        problem: existingArticle.problem,
        direction: existingArticle.direction,
        targetGroup: existingArticle.targetGroup,
        coreMessage: existingArticle.coreMessage,
        hook: existingArticle.hook,
        opponent: existingArticle.opponent,
        goal: existingArticle.goal,
        tags: existingArticle.tags || [],
        author: existingArticle.author || { name: user?.name || '' },
        publishedAt: existingArticle.publishedAt,
        publishedIn: existingArticle.publishedIn,
        successScore: existingArticle.successScore
      });
    }
  }, [existingArticle, user]);

  const successScore = useMemo(() => {
    return calculateSuccessScore(
      { ...formData, id: '', userId: '', createdAt: '', updatedAt: '', collaborators: [], comments: [] },
      counties
    );
  }, [formData.targetKrets, formData.strategies, formData.title, formData.body, counties]);

  const handleSave = async () => {
    const dataToSave = { ...formData, successScore };

    if (articleId) {
      await updateArticle(articleId, dataToSave);
    } else {
      await addArticle(dataToSave);
      onBack();
    }
  };

  const handleDelete = async () => {
    if (articleId && confirm('Er du sikker på at du vil slette denne artikkelen?')) {
      await deleteArticle(articleId);
      onBack();
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9a7b4805/upload-image`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
          body: formData
        }
      );

      if (!response.ok) return;

      const { url } = await response.json();
      setFormData(prev => ({ ...prev, coverImage: url }));
    } catch (error) {
      console.log(`Cover image upload error: ${error}`);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !articleId) return;

    await addComment(articleId, commentText);
    setCommentText('');
  };

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTheme = (theme: Theme) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.includes(theme)
        ? prev.themes.filter(t => t !== theme)
        : [...prev.themes, theme]
    }));
  };

  const toggleStrategy = (strategy: Strategy) => {
    setFormData(prev => ({
      ...prev,
      strategies: prev.strategies.includes(strategy)
        ? prev.strategies.filter(s => s !== strategy)
        : [...prev.strategies, strategy]
    }));
  };

  const toggleKrets = (kretsId: string) => {
    setFormData(prev => ({
      ...prev,
      targetKrets: prev.targetKrets.includes(kretsId)
        ? prev.targetKrets.filter(k => k !== kretsId)
        : [...prev.targetKrets, kretsId]
    }));
  };

  const allKrets = useMemo(() => {
    const krets: Array<{ id: string; name: string; municipality: string; county: string }> = [];
    counties.forEach(county => {
      county.municipalities.forEach(municipality => {
        municipality.kretser.forEach(k => {
          krets.push({
            id: k.id,
            name: k.name,
            municipality: municipality.name,
            county: county.name
          });
        });
      });
    });
    return krets;
  }, [counties]);

  const selectedKretsDetails = useMemo(() => {
    return formData.targetKrets.map(kretsId => {
      for (const county of counties) {
        for (const municipality of county.municipalities) {
          const krets = municipality.kretser.find(k => k.id === kretsId);
          if (krets) return krets;
        }
      }
      return null;
    }).filter(Boolean);
  }, [formData.targetKrets, counties]);

  const strategyTips = useMemo(() => {
    if (selectedKretsDetails.length === 0 || formData.strategies.length === 0) return [];

    const tips: string[] = [];
    const strategyKey = formData.strategies[0] === 'heavy-left' ? 'heavyLeft' : formData.strategies[0];

    selectedKretsDetails.forEach(krets => {
      if (krets) {
        const kretsStrategy = formData.strategies[0] === 'heavy-left' ? 'heavyLeft' :
                             formData.strategies[0] === 'progressive' ? 'progressive' : 'moderate';
        tips.push(...(krets.strategyTips[kretsStrategy] || []));
      }
    });

    return [...new Set(tips)].slice(0, 5);
  }, [selectedKretsDetails, formData.strategies]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Tilbake til oversikt
            </button>

            <div className="flex items-center gap-3">
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="idea">Idé</option>
                <option value="drafting">Under arbeid</option>
                <option value="finished">Ferdig</option>
                <option value="submitted">Sendt inn</option>
                <option value="published">Publisert</option>
              </select>

              <button
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {isPreview ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isPreview ? 'Rediger' : 'Forhåndsvisning'}
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Lagre
              </button>

              {articleId && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-red-600 px-4 py-2 border border-red-300 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {isPreview ? (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white shadow-lg">
            {formData.coverImage ? (
              <img src={formData.coverImage} alt="Cover" className="w-full h-80 object-cover" />
            ) : (
              <div className="h-64 bg-gradient-to-br from-blue-600 to-blue-800" />
            )}

            <div className="p-12">
              <div className="text-sm text-gray-500 mb-4">MENINGER • PLENOR</div>
              <h1 className="text-4xl mb-3" style={{ fontWeight: 700 }}>{formData.title || 'Uten tittel'}</h1>
              {formData.subtitle && (
                <p className="text-xl text-gray-600 mb-8" style={{ fontWeight: 600 }}>{formData.subtitle}</p>
              )}

              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <div>
                  <div style={{ fontWeight: 600 }}>{formData.author.name}</div>
                  {formData.author.title && (
                    <div className="text-sm text-gray-600">{formData.author.title}</div>
                  )}
                  {formData.author.location && (
                    <div className="text-sm text-gray-500">{formData.author.location}</div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.publishedAt
                      ? new Date(formData.publishedAt).toLocaleDateString('nb-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : new Date().toLocaleDateString('nb-NO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                  </div>
                </div>
              </div>

              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: formData.body }} />

              {formData.publishedIn && (
                <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
                  Publisert i {formData.publishedIn}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {successScore > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg">Suksess-score</h3>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-lg ${getSuccessScoreColor(successScore)}`} style={{ fontWeight: 700 }}>
                      {successScore}/100
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{getSuccessScoreFeedback(successScore)}</p>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Planlegging
                  </h2>
                  <button
                    onClick={() => setShowPlanning(!showPlanning)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showPlanning ? 'Skjul' : 'Vis'}
                  </button>
                </div>

                {showPlanning && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Temaer (velg flere)</label>
                      <div className="flex flex-wrap gap-2">
                        {(['housing', 'school', 'transport', 'healthcare', 'environment', 'economy', 'culture', 'labor', 'other'] as Theme[]).map(theme => (
                          <button
                            key={theme}
                            onClick={() => toggleTheme(theme)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                              formData.themes.includes(theme)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Strategier (velg flere)</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStrategy('progressive')}
                          className={`px-4 py-2 rounded-md ${
                            formData.strategies.includes('progressive')
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          Progressiv
                        </button>
                        <button
                          onClick={() => toggleStrategy('moderate')}
                          className={`px-4 py-2 rounded-md ${
                            formData.strategies.includes('moderate')
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          Moderat
                        </button>
                        <button
                          onClick={() => toggleStrategy('heavy-left')}
                          className={`px-4 py-2 rounded-md ${
                            formData.strategies.includes('heavy-left')
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          Venstreradikal
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Problem</label>
                      <textarea
                        value={formData.problem}
                        onChange={(e) => updateField('problem', e.target.value)}
                        placeholder="Hva er problemet du adresserer?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Retning/Løsning</label>
                      <textarea
                        value={formData.direction}
                        onChange={(e) => updateField('direction', e.target.value)}
                        placeholder="Hva er løsningen?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Kjernebudskap</label>
                      <textarea
                        value={formData.coreMessage}
                        onChange={(e) => updateField('coreMessage', e.target.value)}
                        placeholder="Hva er hovedpoenget ditt?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Hook (første setning)</label>
                      <input
                        type="text"
                        value={formData.hook}
                        onChange={(e) => updateField('hook', e.target.value)}
                        placeholder="Fang leserens oppmerksomhet..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Artikkel
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Forsidebilde</label>
                    {formData.coverImage && (
                      <img src={formData.coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg mb-2" />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 w-fit">
                      <Upload className="w-4 h-4" />
                      {formData.coverImage ? 'Endre bilde' : 'Last opp bilde'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm mb-1.5">Tittel</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Skriv en fengende tittel..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xl"
                      style={{ fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1.5">Undertittel</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => updateField('subtitle', e.target.value)}
                      placeholder="Utdyp tittelen (valgfritt)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      style={{ fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1.5">Brødtekst</label>
                    <RichTextEditor
                      content={formData.body}
                      onChange={(content) => updateField('body', content)}
                      placeholder="Skriv artikkelen din her..."
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-sm mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Forfatter
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Navn"
                        value={formData.author.name}
                        onChange={(e) => updateField('author', { ...formData.author, name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Tittel/rolle (valgfritt)"
                        value={formData.author.title || ''}
                        onChange={(e) => updateField('author', { ...formData.author, title: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Sted (valgfritt)"
                        value={formData.author.location || ''}
                        onChange={(e) => updateField('author', { ...formData.author, location: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {formData.status === 'published' && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h3 className="text-sm mb-3">Publiseringsinformasjon</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Publisert i (f.eks. Aftenposten)"
                          value={formData.publishedIn || ''}
                          onChange={(e) => updateField('publishedIn', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                          type="date"
                          value={formData.publishedAt ? formData.publishedAt.split('T')[0] : ''}
                          onChange={(e) => updateField('publishedAt', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
                <h3 className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5" />
                  Målretting
                </h3>

                <div className="mb-4">
                  <label className="block text-sm mb-2">Velg krets(er)</label>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {allKrets.map(krets => (
                      <label key={krets.id} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.targetKrets.includes(krets.id)}
                          onChange={() => toggleKrets(krets.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="text-sm">{krets.name}</div>
                          <div className="text-xs text-gray-500">{krets.municipality}, {krets.county}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {strategyTips.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="flex items-center gap-2 text-sm mb-2">
                      <Lightbulb className="w-4 h-4" />
                      Strategitips
                    </h4>
                    <ul className="space-y-2">
                      {strategyTips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {articleId && existingArticle && (
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5" />
                    Kommentarer
                  </h3>

                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {existingArticle.comments?.map(comment => (
                      <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm" style={{ fontWeight: 600 }}>{comment.userName}</div>
                        <div className="text-sm text-gray-700 mt-1">{comment.text}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString('nb-NO')}
                        </div>
                      </div>
                    ))}
                    {(!existingArticle.comments || existingArticle.comments.length === 0) && (
                      <p className="text-sm text-gray-500">Ingen kommentarer ennå</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Skriv en kommentar..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
