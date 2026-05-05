import { Krets } from '../contexts/ArticleContext';

export interface KretsCharacteristics {
  name: Krets;
  description: string;
  politicalLeaning: string;
  keyIssues: string[];
  demographics: string;
  strategyTips: {
    progressive: string[];
    moderate: string[];
    'heavy-left': string[];
  };
}

export const kretsData: Record<Krets, KretsCharacteristics> = {
  Tangen: {
    name: 'Tangen',
    description: 'Urban, educated, environmentally conscious',
    politicalLeaning: 'Progressive',
    keyIssues: ['Climate action', 'Urban development', 'Public transport'],
    demographics: 'Young professionals, families',
    strategyTips: {
      progressive: [
        'Focus on climate solutions and sustainable development',
        'Emphasize collective action and community benefits',
        'Use forward-looking, optimistic language'
      ],
      moderate: [
        'Balance environmental concerns with practical solutions',
        'Highlight economic benefits of green policies',
        'Address concerns about implementation costs'
      ],
      'heavy-left': [
        'Connect climate justice to social inequality',
        'Critique corporate influence on environmental policy',
        'Emphasize systemic change over individual action'
      ]
    }
  },
  Berger: {
    name: 'Berger',
    description: 'Suburban, family-oriented, pragmatic',
    politicalLeaning: 'Moderate',
    keyIssues: ['Schools', 'Local services', 'Housing affordability'],
    demographics: 'Families with children, middle-income',
    strategyTips: {
      progressive: [
        'Frame progressive policies as benefiting families',
        'Use concrete examples from everyday life',
        'Avoid overly ideological language'
      ],
      moderate: [
        'Focus on practical solutions over ideology',
        'Emphasize cost-effectiveness and proven results',
        'Address concerns about change and stability'
      ],
      'heavy-left': [
        'Connect daily struggles to broader economic structures',
        'Highlight wealth inequality impact on families',
        'Use accessible language, avoid jargon'
      ]
    }
  },
  Fjellstrand: {
    name: 'Fjellstrand',
    description: 'Rural, traditional, community-focused',
    politicalLeaning: 'Conservative-leaning moderate',
    keyIssues: ['Local services', 'Infrastructure', 'Traditions'],
    demographics: 'Mixed ages, strong local ties',
    strategyTips: {
      progressive: [
        'Respect tradition while proposing gradual improvements',
        'Emphasize community benefits and local control',
        'Use local examples and success stories'
      ],
      moderate: [
        'Focus on preserving what works while fixing problems',
        'Emphasize practical improvements to daily life',
        'Avoid appearing to impose outside solutions'
      ],
      'heavy-left': [
        'Frame systemic issues as threats to local communities',
        'Connect to historical workers\' movements',
        'Emphasize solidarity and collective strength'
      ]
    }
  },
  Sentrum: {
    name: 'Sentrum',
    description: 'Urban center, diverse, politically engaged',
    politicalLeaning: 'Mixed progressive-moderate',
    keyIssues: ['Housing', 'Culture', 'Urban planning'],
    demographics: 'Diverse age and income groups',
    strategyTips: {
      progressive: [
        'Address multiple perspectives and identities',
        'Focus on inclusive policies and representation',
        'Use intersectional analysis'
      ],
      moderate: [
        'Balance competing interests and priorities',
        'Emphasize evidence-based solutions',
        'Address practical implementation challenges'
      ],
      'heavy-left': [
        'Critique gentrification and displacement',
        'Emphasize housing as a human right',
        'Connect urban issues to class struggle'
      ]
    }
  },
  Nordby: {
    name: 'Nordby',
    description: 'Working-class, industrial heritage, skeptical of elites',
    politicalLeaning: 'Left-leaning',
    keyIssues: ['Jobs', 'Healthcare', 'Economic security'],
    demographics: 'Working class, mixed ages',
    strategyTips: {
      progressive: [
        'Focus on economic security and worker protections',
        'Avoid academic or elite-coded language',
        'Emphasize solidarity and collective bargaining'
      ],
      moderate: [
        'Address economic concerns directly and honestly',
        'Focus on job creation and economic stability',
        'Avoid appearing detached from working-class realities'
      ],
      'heavy-left': [
        'Critique exploitation and corporate power',
        'Emphasize class consciousness and worker power',
        'Connect local struggles to broader labor movement'
      ]
    }
  },
  Østby: {
    name: 'Østby',
    description: 'Affluent, highly educated, socially liberal',
    politicalLeaning: 'Progressive',
    keyIssues: ['Education', 'Environment', 'Cultural policies'],
    demographics: 'High-income professionals, retirees',
    strategyTips: {
      progressive: [
        'Use sophisticated analysis and policy details',
        'Emphasize international perspectives and comparisons',
        'Focus on long-term thinking and systemic solutions'
      ],
      moderate: [
        'Balance idealism with pragmatism',
        'Address concerns about economic impacts',
        'Emphasize evidence-based policy making'
      ],
      'heavy-left': [
        'Challenge comfortable assumptions about meritocracy',
        'Address privilege and structural inequality',
        'Call for solidarity across class lines'
      ]
    }
  }
};
