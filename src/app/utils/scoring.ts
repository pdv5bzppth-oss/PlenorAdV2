import { Article, Strategy } from '../contexts/ArticleContext';
import { County, KretsData } from '../data/enhancedKretsData';

export function calculateSuccessScore(article: Article, counties: County[]): number {
  if (article.targetKrets.length === 0 || article.strategies.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let scoredKrets = 0;

  const allKrets: KretsData[] = [];
  counties.forEach(county => {
    county.municipalities.forEach(municipality => {
      allKrets.push(...municipality.kretser);
    });
  });

  article.targetKrets.forEach(kretsId => {
    const kretsData = allKrets.find(k => k.id === kretsId);
    if (!kretsData) return;

    scoredKrets++;

    article.strategies.forEach(strategy => {
      let strategyKey: keyof typeof kretsData.politicalScores;
      switch (strategy) {
        case 'progressive':
          strategyKey = 'progressive';
          break;
        case 'moderate':
          strategyKey = 'moderate';
          break;
        case 'heavy-left':
          strategyKey = 'heavyLeft';
          break;
      }

      const politicalScore = kretsData.politicalScores[strategyKey];

      const alignmentScore = politicalScore / 10;

      const contentCompletenessBonus =
        (article.title ? 0.1 : 0) +
        (article.hook ? 0.1 : 0) +
        (article.body && article.body.length > 100 ? 0.1 : 0) +
        (article.coreMessage ? 0.05 : 0) +
        (article.problem ? 0.05 : 0);

      const strategyScore = alignmentScore + contentCompletenessBonus;
      totalScore += strategyScore;
    });
  });

  if (scoredKrets === 0) return 0;

  const averageScore = totalScore / (scoredKrets * article.strategies.length);
  return Math.round(Math.min(averageScore * 100, 100));
}

export function getSuccessScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-100';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
}

export function getSuccessScoreFeedback(score: number): string {
  if (score >= 80) return 'Excellent match! This strategy aligns very well with your target audience.';
  if (score >= 60) return 'Good match. Your strategy should resonate with the target krets.';
  if (score >= 40) return 'Moderate match. Consider adjusting your strategy or messaging.';
  if (score >= 20) return 'Weak match. This strategy may not resonate well with your target audience.';
  return 'Poor match. Consider selecting different krets or changing your strategic approach.';
}
