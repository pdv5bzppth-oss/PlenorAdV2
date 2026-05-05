export interface PoliticalScores {
  progressive: number; // 1-10
  moderate: number; // 1-10
  heavyLeft: number; // 1-10
}

export interface KretsData {
  id: string;
  name: string;
  municipalityId: string;
  description: string;
  demographics: string;
  keyIssues: string[];
  politicalScores: PoliticalScores;
  strategyTips: {
    progressive: string[];
    moderate: string[];
    heavyLeft: string[];
  };
}

export interface Municipality {
  id: string;
  name: string;
  countyId: string;
  description: string;
  politicalScores: PoliticalScores;
  kretser: KretsData[];
}

export interface County {
  id: string;
  name: string;
  description: string;
  politicalScores: PoliticalScores;
  municipalities: Municipality[];
}

export const defaultKretsHierarchy: County[] = [
  {
    id: 'oslo',
    name: 'Oslo',
    description: 'Hovedstaden, urbant og politisk mangfoldig',
    politicalScores: { progressive: 7, moderate: 6, heavyLeft: 5 },
    municipalities: [
      {
        id: 'oslo-sentrum',
        name: 'Oslo Sentrum',
        countyId: 'oslo',
        description: 'Sentrale bydeler med høy tetthet',
        politicalScores: { progressive: 8, moderate: 5, heavyLeft: 6 },
        kretser: [
          {
            id: 'sentrum',
            name: 'Sentrum',
            municipalityId: 'oslo-sentrum',
            description: 'Urban center, diverse, politically engaged',
            demographics: 'Diverse age and income groups',
            keyIssues: ['Housing', 'Culture', 'Urban planning'],
            politicalScores: { progressive: 8, moderate: 6, heavyLeft: 5 },
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
              heavyLeft: [
                'Critique gentrification and displacement',
                'Emphasize housing as a human right',
                'Connect urban issues to class struggle'
              ]
            }
          },
          {
            id: 'tangen',
            name: 'Tangen',
            municipalityId: 'oslo-sentrum',
            description: 'Urban, educated, environmentally conscious',
            demographics: 'Young professionals, families',
            keyIssues: ['Climate action', 'Urban development', 'Public transport'],
            politicalScores: { progressive: 9, moderate: 4, heavyLeft: 7 },
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
              heavyLeft: [
                'Connect climate justice to social inequality',
                'Critique corporate influence on environmental policy',
                'Emphasize systemic change over individual action'
              ]
            }
          }
        ]
      },
      {
        id: 'oslo-vest',
        name: 'Oslo Vest',
        countyId: 'oslo',
        description: 'Velstående vestkant-områder',
        politicalScores: { progressive: 7, moderate: 8, heavyLeft: 3 },
        kretser: [
          {
            id: 'ostby',
            name: 'Østby',
            municipalityId: 'oslo-vest',
            description: 'Affluent, highly educated, socially liberal',
            demographics: 'High-income professionals, retirees',
            keyIssues: ['Education', 'Environment', 'Cultural policies'],
            politicalScores: { progressive: 8, moderate: 7, heavyLeft: 3 },
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
              heavyLeft: [
                'Challenge comfortable assumptions about meritocracy',
                'Address privilege and structural inequality',
                'Call for solidarity across class lines'
              ]
            }
          }
        ]
      },
      {
        id: 'oslo-ost',
        name: 'Oslo Øst',
        countyId: 'oslo',
        description: 'Arbeiderklasse og mangfoldig øst',
        politicalScores: { progressive: 6, moderate: 5, heavyLeft: 8 },
        kretser: [
          {
            id: 'nordby',
            name: 'Nordby',
            municipalityId: 'oslo-ost',
            description: 'Working-class, industrial heritage, skeptical of elites',
            demographics: 'Working class, mixed ages',
            keyIssues: ['Jobs', 'Healthcare', 'Economic security'],
            politicalScores: { progressive: 5, moderate: 4, heavyLeft: 9 },
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
              heavyLeft: [
                'Critique exploitation and corporate power',
                'Emphasize class consciousness and worker power',
                'Connect local struggles to broader labor movement'
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'viken',
    name: 'Viken',
    description: 'Forstadsområder rundt Oslo',
    politicalScores: { progressive: 5, moderate: 7, heavyLeft: 4 },
    municipalities: [
      {
        id: 'berger-kommune',
        name: 'Berger Kommune',
        countyId: 'viken',
        description: 'Suburban family areas',
        politicalScores: { progressive: 5, moderate: 8, heavyLeft: 3 },
        kretser: [
          {
            id: 'berger',
            name: 'Berger',
            municipalityId: 'berger-kommune',
            description: 'Suburban, family-oriented, pragmatic',
            demographics: 'Families with children, middle-income',
            keyIssues: ['Schools', 'Local services', 'Housing affordability'],
            politicalScores: { progressive: 5, moderate: 8, heavyLeft: 3 },
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
              heavyLeft: [
                'Connect daily struggles to broader economic structures',
                'Highlight wealth inequality impact on families',
                'Use accessible language, avoid jargon'
              ]
            }
          },
          {
            id: 'fjellstrand',
            name: 'Fjellstrand',
            municipalityId: 'berger-kommune',
            description: 'Rural, traditional, community-focused',
            demographics: 'Mixed ages, strong local ties',
            keyIssues: ['Local services', 'Infrastructure', 'Traditions'],
            politicalScores: { progressive: 4, moderate: 8, heavyLeft: 3 },
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
              heavyLeft: [
                'Frame systemic issues as threats to local communities',
                'Connect to historical workers\' movements',
                'Emphasize solidarity and collective strength'
              ]
            }
          }
        ]
      }
    ]
  }
];
