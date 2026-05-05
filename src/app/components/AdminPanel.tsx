import React, { useState } from 'react';
import { useKrets } from '../contexts/KretsContext';
import { County } from '../data/enhancedKretsData';
import { Lock, Save, X, Plus, Trash2, Settings } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const { counties, updateKrets } = useKrets();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editedCounties, setEditedCounties] = useState<County[]>([...counties]);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const handleLogin = () => {
    if (password === 'plenor2026') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Feil passord');
    }
  };

  const handleSave = async () => {
    const success = await updateKrets(editedCounties, password);
    if (success) {
      setSaveMessage('Endringer lagret!');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setError('Kunne ikke lagre endringer');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Admin Panel
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-2">Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Skriv inn admin-passord"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Logg inn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Krets-administrasjon
          </h2>
          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className="text-green-600 text-sm">{saveMessage}</span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Lagre endringer
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <p className="text-sm text-gray-600 mb-6">
            Administrer fylker, kommuner og kretser. Juster politiske scorer (1-10) og strategitips for hver krets.
          </p>

          <div className="space-y-8">
            {editedCounties.map((county, countyIdx) => (
              <div key={county.id} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="mb-4">
                  <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>Fylke: {county.name}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Progressiv (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={county.politicalScores.progressive}
                        onChange={(e) => {
                          const newCounties = [...editedCounties];
                          newCounties[countyIdx].politicalScores.progressive = parseInt(e.target.value) || 1;
                          setEditedCounties(newCounties);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Moderat (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={county.politicalScores.moderate}
                        onChange={(e) => {
                          const newCounties = [...editedCounties];
                          newCounties[countyIdx].politicalScores.moderate = parseInt(e.target.value) || 1;
                          setEditedCounties(newCounties);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Venstreradikal (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={county.politicalScores.heavyLeft}
                        onChange={(e) => {
                          const newCounties = [...editedCounties];
                          newCounties[countyIdx].politicalScores.heavyLeft = parseInt(e.target.value) || 1;
                          setEditedCounties(newCounties);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {county.municipalities.map((municipality, munIdx) => (
                  <div key={municipality.id} className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="mb-3" style={{ fontWeight: 600 }}>Kommune: {municipality.name}</h4>

                    {municipality.kretser.map((krets, kretsIdx) => (
                      <div key={krets.id} className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                        <div className="mb-2">
                          <input
                            type="text"
                            value={krets.name}
                            onChange={(e) => {
                              const newCounties = [...editedCounties];
                              newCounties[countyIdx].municipalities[munIdx].kretser[kretsIdx].name = e.target.value;
                              setEditedCounties(newCounties);
                            }}
                            className="px-3 py-1 border border-gray-300 rounded"
                            style={{ fontWeight: 600 }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div>
                            <label className="text-xs text-gray-600">Progressiv</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={krets.politicalScores.progressive}
                              onChange={(e) => {
                                const newCounties = [...editedCounties];
                                newCounties[countyIdx].municipalities[munIdx].kretser[kretsIdx].politicalScores.progressive = parseInt(e.target.value) || 1;
                                setEditedCounties(newCounties);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Moderat</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={krets.politicalScores.moderate}
                              onChange={(e) => {
                                const newCounties = [...editedCounties];
                                newCounties[countyIdx].municipalities[munIdx].kretser[kretsIdx].politicalScores.moderate = parseInt(e.target.value) || 1;
                                setEditedCounties(newCounties);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Venstreradikal</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={krets.politicalScores.heavyLeft}
                              onChange={(e) => {
                                const newCounties = [...editedCounties];
                                newCounties[countyIdx].municipalities[munIdx].kretser[kretsIdx].politicalScores.heavyLeft = parseInt(e.target.value) || 1;
                                setEditedCounties(newCounties);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <div><strong>Beskrivelse:</strong> {krets.description}</div>
                          <div><strong>Demografi:</strong> {krets.demographics}</div>
                          <div><strong>Nøkkelspørsmål:</strong> {krets.keyIssues.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
