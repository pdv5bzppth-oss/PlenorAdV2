import React, { useState, useEffect } from 'react';
import { useArticles, Article, ArticleStatus, Theme, Strategy, Krets } from '../contexts/ArticleContext';
import { kretsData } from '../data/kretsData';
import { ArrowLeft, Save, Eye, Edit, Target, Lightbulb, Trash2 } from 'lucide-react';

interface ArticleEditorProps {
  articleId?: string;
  onBack: () => void;
}

export function ArticleEditor({ articleId, onBack }: ArticleEditorProps) {
  const { articles, addArticle, updateArticle, deleteArticle } = useArticles();
  const [isPreview, setIsPreview] = useState(false);
  const [showPlanning, setShowPlanning] = useState(true);

  const existingArticle = articleId ? articles.find(a => a.id === articleId) : undefined;

  const [formData, setFormData] = useState<Omit<Article, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
    title: '',
    subtitle: '',
    body: '',
    status: 'idea',
    theme: 'other',
    targetKrets: [],
    strategy: 'moderate',
    problem: '',
    direction: '',
    targetGroup: '',
    coreMessage: '',
    hook: '',
    opponent: '',
    goal: '',
    tags: []
  });

  useEffect(() => {
    if (existingArticle) {
      setFormData(existingArticle);
    }
  }, [existingArticle]);

  const handleSave = () => {
    if (articleId) {
      updateArticle(articleId, formData);
    } else {
      addArticle(formData);
      onBack();
    }
  };

  const handleDelete = () => {
    if (articleId && confirm('Er du sikker på at du vil slette denne artikkelen?')) {
      deleteArticle(articleId);
      onBack();
    }
  };

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleKrets = (krets: Krets) => {
    setFormData(prev => ({
      ...prev,
      targetKrets: prev.targetKrets.includes(krets)
        ? prev.targetKrets.filter(k => k !== krets)
        : [...prev.targetKrets, krets]
    }));
  };

  const selectedKretsData = formData.targetKrets.map(k => kretsData[k]);
  const currentStrategyTips = selectedKretsData.length > 0
    ? selectedKretsData[0].strategyTips[formData.strategy]
    : [];

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
              Tilbake
            </button>

            <div className="flex items-center gap-3">
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value as ArticleStatus)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="idea">Idé</option>
                <option value="drafting">Under arbeid</option>
                <option value="finished">Ferdig</option>
                <option value="submitted">Sendt inn</option>
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
            <div className="h-64 bg-gradient-to-br from-blue-600 to-blue-800 flex items-end p-8">
              <div>
                <div className="text-white/80 text-sm mb-2">MENINGER</div>
                <h1 className="text-4xl text-white mb-3">{formData.title || 'Uten tittel'}</h1>
                {formData.subtitle && (
                  <p className="text-xl text-white/90">{formData.subtitle}</p>
                )}
              </div>
            </div>

            <div className="p-12">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <div>
                  <div className="font-medium">Forfatter</div>
                  <div className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('nb-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {formData.hook && (
                <p className="text-xl leading-relaxed mb-6 text-gray-900">
                  {formData.hook}
                </p>
              )}

              <div className="prose prose-lg max-w-none">
                {formData.body.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 leading-relaxed text-gray-800">
                    {paragraph}
                  </p>
                ))}
              </div>

              {!formData.body && (
                <p className="text-gray-400 italic">
                  Brødteksten vises her når du skriver innholdet...
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-1.5">Tema</label>
                        <select
                          value={formData.theme}
                          onChange={(e) => updateField('theme', e.target.value as Theme)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="housing">Bolig</option>
                          <option value="school">Skole</option>
                          <option value="transport">Transport</option>
                          <option value="healthcare">Helse</option>
                          <option value="environment">Miljø</option>
                          <option value="economy">Økonomi</option>
                          <option value="other">Annet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm mb-1.5">Strategi</label>
                        <select
                          value={formData.strategy}
                          onChange={(e) => updateField('strategy', e.target.value as Strategy)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="progressive">Progressiv</option>
                          <option value="moderate">Moderat</option>
                          <option value="heavy-left">Venstreradikal</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Problem</label>
                      <textarea
                        value={formData.problem}
                        onChange={(e) => updateField('problem', e.target.value)}
                        placeholder="Hva er problemet du adresserer?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Retning/Løsning</label>
                      <textarea
                        value={formData.direction}
                        onChange={(e) => updateField('direction', e.target.value)}
                        placeholder="Hva er løsningen eller retningen?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Målgruppe</label>
                      <input
                        type="text"
                        value={formData.targetGroup}
                        onChange={(e) => updateField('targetGroup', e.target.value)}
                        placeholder="Hvem henvender du deg til?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Kjernebudskap</label>
                      <textarea
                        value={formData.coreMessage}
                        onChange={(e) => updateField('coreMessage', e.target.value)}
                        placeholder="Hva er hovedpoenget ditt?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Motpart</label>
                      <input
                        type="text"
                        value={formData.opponent}
                        onChange={(e) => updateField('opponent', e.target.value)}
                        placeholder="Hvem eller hva argumenterer du imot?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1.5">Mål</label>
                      <input
                        type="text"
                        value={formData.goal}
                        onChange={(e) => updateField('goal', e.target.value)}
                        placeholder="Hva ønsker du å oppnå?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg mb-4">Artikkel</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1.5">Tittel</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Skriv en fengende tittel..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1.5">Undertittel</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => updateField('subtitle', e.target.value)}
                      placeholder="Utdyp tittelen (valgfritt)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1.5">Brødtekst</label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => updateField('body', e.target.value)}
                      placeholder="Skriv artikkelen din her..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                      rows={20}
                    />
                  </div>
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
                  <div className="space-y-2">
                    {(Object.keys(kretsData) as Krets[]).map(krets => (
                      <label key={krets} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.targetKrets.includes(krets)}
                          onChange={() => toggleKrets(krets)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="text-sm">{krets}</div>
                          <div className="text-xs text-gray-500">{kretsData[krets].description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedKretsData.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <h4 className="text-sm mb-2">Kjennetegn</h4>
                      <div className="space-y-2">
                        {selectedKretsData.map(krets => (
                          <div key={krets.name} className="text-sm">
                            <div className="text-xs text-gray-500">{krets.name}</div>
                            <div className="text-blue-700">{krets.politicalLeaning}</div>
                            <div className="text-xs text-gray-600">{krets.demographics}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="flex items-center gap-2 text-sm mb-2">
                        <Lightbulb className="w-4 h-4" />
                        Strategitips
                      </h4>
                      <ul className="space-y-2">
                        {currentStrategyTips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
