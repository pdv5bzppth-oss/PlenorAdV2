import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { County } from '../data/enhancedKretsData';

interface KretsTreeSelectorProps {
  counties: County[];
  selectedKrets: string[];
  onChange: (selectedKrets: string[]) => void;
}

export function KretsTreeSelector({ counties, selectedKrets, onChange }: KretsTreeSelectorProps) {
  const [expandedCounties, setExpandedCounties] = useState<Set<string>>(new Set());
  const [expandedMunicipalities, setExpandedMunicipalities] = useState<Set<string>>(new Set());

  const allKretsIds = useMemo(() => {
    const ids: string[] = [];
    counties.forEach(county => {
      county.municipalities.forEach(municipality => {
        municipality.kretser.forEach(krets => {
          ids.push(krets.id);
        });
      });
    });
    return ids;
  }, [counties]);

  const getCountyKretsIds = (county: County): string[] => {
    const ids: string[] = [];
    county.municipalities.forEach(municipality => {
      municipality.kretser.forEach(krets => {
        ids.push(krets.id);
      });
    });
    return ids;
  };

  const getMunicipalityKretsIds = (county: County, municipalityId: string): string[] => {
    const municipality = county.municipalities.find(m => m.id === municipalityId);
    return municipality ? municipality.kretser.map(k => k.id) : [];
  };

  const isCountyFullySelected = (county: County): boolean => {
    const countyKretsIds = getCountyKretsIds(county);
    return countyKretsIds.every(id => selectedKrets.includes(id));
  };

  const isCountyPartiallySelected = (county: County): boolean => {
    const countyKretsIds = getCountyKretsIds(county);
    return countyKretsIds.some(id => selectedKrets.includes(id)) && !isCountyFullySelected(county);
  };

  const isMunicipalityFullySelected = (county: County, municipalityId: string): boolean => {
    const municipalityKretsIds = getMunicipalityKretsIds(county, municipalityId);
    return municipalityKretsIds.every(id => selectedKrets.includes(id));
  };

  const isMunicipalityPartiallySelected = (county: County, municipalityId: string): boolean => {
    const municipalityKretsIds = getMunicipalityKretsIds(county, municipalityId);
    return municipalityKretsIds.some(id => selectedKrets.includes(id)) && !isMunicipalityFullySelected(county, municipalityId);
  };

  const toggleCounty = (county: County) => {
    const countyKretsIds = getCountyKretsIds(county);
    const isFullySelected = isCountyFullySelected(county);

    if (isFullySelected) {
      onChange(selectedKrets.filter(id => !countyKretsIds.includes(id)));
    } else {
      const newSelected = [...selectedKrets];
      countyKretsIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onChange(newSelected);
    }
  };

  const toggleMunicipality = (county: County, municipalityId: string) => {
    const municipalityKretsIds = getMunicipalityKretsIds(county, municipalityId);
    const isFullySelected = isMunicipalityFullySelected(county, municipalityId);

    if (isFullySelected) {
      onChange(selectedKrets.filter(id => !municipalityKretsIds.includes(id)));
    } else {
      const newSelected = [...selectedKrets];
      municipalityKretsIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onChange(newSelected);
    }
  };

  const toggleKrets = (kretsId: string) => {
    if (selectedKrets.includes(kretsId)) {
      onChange(selectedKrets.filter(id => id !== kretsId));
    } else {
      onChange([...selectedKrets, kretsId]);
    }
  };

  const toggleCountyExpanded = (countyId: string) => {
    const newExpanded = new Set(expandedCounties);
    if (newExpanded.has(countyId)) {
      newExpanded.delete(countyId);
    } else {
      newExpanded.add(countyId);
    }
    setExpandedCounties(newExpanded);
  };

  const toggleMunicipalityExpanded = (municipalityId: string) => {
    const newExpanded = new Set(expandedMunicipalities);
    if (newExpanded.has(municipalityId)) {
      newExpanded.delete(municipalityId);
    } else {
      newExpanded.add(municipalityId);
    }
    setExpandedMunicipalities(newExpanded);
  };

  const getSelectedCount = (type: 'county' | 'municipality', county: County, municipalityId?: string): number => {
    if (type === 'county') {
      return getCountyKretsIds(county).filter(id => selectedKrets.includes(id)).length;
    } else if (type === 'municipality' && municipalityId) {
      return getMunicipalityKretsIds(county, municipalityId).filter(id => selectedKrets.includes(id)).length;
    }
    return 0;
  };

  return (
    <div className="space-y-1">
      {counties.map(county => {
        const isExpanded = expandedCounties.has(county.id);
        const isFullySelected = isCountyFullySelected(county);
        const isPartiallySelected = isCountyPartiallySelected(county);
        const selectedCount = getSelectedCount('county', county);
        const totalCount = getCountyKretsIds(county).length;

        return (
          <div key={county.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="flex items-center gap-2 p-2 hover:bg-gray-50">
              <button
                onClick={() => toggleCountyExpanded(county.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <input
                type="checkbox"
                checked={isFullySelected}
                ref={input => {
                  if (input) {
                    input.indeterminate = isPartiallySelected;
                  }
                }}
                onChange={() => toggleCounty(county)}
                className="w-4 h-4"
              />

              <span className="flex-1 text-sm" style={{ fontWeight: 600 }}>
                {county.name}
              </span>

              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {selectedCount}/{totalCount}
              </span>
            </div>

            {isExpanded && (
              <div className="pl-6 pb-2">
                {county.municipalities.map(municipality => {
                  const isMunExpanded = expandedMunicipalities.has(municipality.id);
                  const isMunFullySelected = isMunicipalityFullySelected(county, municipality.id);
                  const isMunPartiallySelected = isMunicipalityPartiallySelected(county, municipality.id);
                  const munSelectedCount = getSelectedCount('municipality', county, municipality.id);
                  const munTotalCount = municipality.kretser.length;

                  return (
                    <div key={municipality.id} className="mt-1">
                      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                        <button
                          onClick={() => toggleMunicipalityExpanded(municipality.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isMunExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        <input
                          type="checkbox"
                          checked={isMunFullySelected}
                          ref={input => {
                            if (input) {
                              input.indeterminate = isMunPartiallySelected;
                            }
                          }}
                          onChange={() => toggleMunicipality(county, municipality.id)}
                          className="w-4 h-4"
                        />

                        <span className="flex-1 text-sm">
                          {municipality.name}
                        </span>

                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {munSelectedCount}/{munTotalCount}
                        </span>
                      </div>

                      {isMunExpanded && (
                        <div className="pl-6 mt-1 space-y-1">
                          {municipality.kretser.map(krets => (
                            <label key={krets.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedKrets.includes(krets.id)}
                                onChange={() => toggleKrets(krets.id)}
                                className="w-4 h-4 ml-5"
                              />
                              <span className="text-sm">{krets.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
