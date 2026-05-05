import { Article, Theme, Strategy } from '../contexts/ArticleContext';
import { County, KretsData } from '../data/enhancedKretsData';
import { PublicationOutlet } from '../types/globalSettings';

interface TargetSuggestion {
  type: 'krets' | 'municipality' | 'county';
  id: string;
  name: string;
  matchScore: number;
  reason: string;
}

interface OutletSuggestion {
  outlet: PublicationOutlet;
  matchScore: number;
  reasons: string[];
}

export function suggestTargetAreas(
  themes: Theme[],
  strategies: Strategy[],
  counties: County[],
  limit: number = 5
): TargetSuggestion[] {
  const suggestions: TargetSuggestion[] = [];

  if (themes.length === 0 || strategies.length === 0) {
    return [];
  }

  const allKrets: Array<{ krets: KretsData; municipalityName: string; countyName: string }> = [];
  counties.forEach(county => {
    county.municipalities.forEach(municipality => {
      municipality.kretser.forEach(krets => {
        allKrets.push({
          krets,
          municipalityName: municipality.name,
          countyName: county.name
        });
      });
    });
  });

  allKrets.forEach(({ krets, municipalityName, countyName }) => {
    let totalScore = 0;
    const reasons: string[] = [];

    strategies.forEach(strategy => {
      const scoreKey = strategy === 'heavy-left' ? 'heavyLeft' : strategy === 'progressive' ? 'progressive' : 'moderate';
      const score = krets.politicalScores[scoreKey];

      if (score >= 7) {
        totalScore += score;
        reasons.push(`Høy ${scoreKey}-score (${score}/10)`);
      } else if (score >= 5) {
        totalScore += score * 0.7;
      }
    });

    const themeMatch = krets.keyIssues.some(issue =>
      themes.some(theme => issue.toLowerCase().includes(theme.toLowerCase()))
    );

    if (themeMatch) {
      totalScore += 15;
      reasons.push('Matcher nøkkelspørsmål');
    }

    if (totalScore > 0) {
      const matchScore = Math.min(Math.round(totalScore / strategies.length), 100);
      suggestions.push({
        type: 'krets',
        id: krets.id,
        name: `${krets.name} (${municipalityName}, ${countyName})`,
        matchScore,
        reason: reasons.join(', ') || 'Generell match'
      });
    }
  });

  return suggestions
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function suggestPublicationOutlets(
  themes: Theme[],
  strategies: Strategy[],
  targetKrets: string[],
  outlets: PublicationOutlet[],
  counties: County[],
  limit: number = 3
): OutletSuggestion[] {
  const suggestions: OutletSuggestion[] = [];

  if (themes.length === 0 && strategies.length === 0 && targetKrets.length === 0) {
    return [];
  }

  const targetCounties = new Set<string>();
  const targetMunicipalities = new Set<string>();

  targetKrets.forEach(kretsId => {
    counties.forEach(county => {
      county.municipalities.forEach(municipality => {
        const krets = municipality.kretser.find(k => k.id === kretsId);
        if (krets) {
          targetCounties.add(county.id);
          targetMunicipalities.add(municipality.id);
        }
      });
    });
  });

  outlets.forEach(outlet => {
    let matchScore = 0;
    const reasons: string[] = [];

    const themeMatches = themes.filter(theme => outlet.supportedThemes.includes(theme));
    if (themeMatches.length > 0) {
      matchScore += (themeMatches.length / themes.length) * 40;
      reasons.push(`Støtter ${themeMatches.length}/${themes.length} temaer`);
    }

    const strategyMatches = strategies.filter(strategy => outlet.supportedStrategies.includes(strategy));
    if (strategyMatches.length > 0) {
      matchScore += (strategyMatches.length / strategies.length) * 30;
      reasons.push(`Støtter ${strategyMatches.length}/${strategies.length} strategier`);
    }

    const countyMatch = Array.from(targetCounties).some(county =>
      outlet.coverageCounties.includes(county)
    );
    const municipalityMatch = Array.from(targetMunicipalities).some(municipality =>
      outlet.coverageMunicipalities.includes(municipality)
    );
    const kretsMatch = targetKrets.some(krets =>
      outlet.coverageKrets.includes(krets)
    );

    if (kretsMatch) {
      matchScore += 30;
      reasons.push('Dekker målkretser');
    } else if (municipalityMatch) {
      matchScore += 20;
      reasons.push('Dekker målkommuner');
    } else if (countyMatch) {
      matchScore += 15;
      reasons.push('Dekker fylket');
    }

    if (matchScore > 0) {
      suggestions.push({
        outlet,
        matchScore: Math.round(matchScore),
        reasons
      });
    }
  });

  return suggestions
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
