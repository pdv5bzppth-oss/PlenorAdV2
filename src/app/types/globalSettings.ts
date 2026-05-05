import { Theme, Strategy } from '../contexts/ArticleContext';
import { County } from '../data/enhancedKretsData';

export interface PublicationOutlet {
  id: string;
  name: string;
  logo?: string;
  supportedThemes: Theme[];
  supportedStrategies: Strategy[];
  coverageKrets: string[];
  coverageMunicipalities: string[];
  coverageCounties: string[];
  description?: string;
}

export interface ThemeDefinition {
  id: Theme;
  nameNo: string;
  color: string;
  icon?: string;
}

export interface StrategyDefinition {
  id: Strategy;
  nameNo: string;
  color: string;
  icon?: string;
}

export interface GlobalSettings {
  counties: County[];
  themes: ThemeDefinition[];
  strategies: StrategyDefinition[];
  outlets: PublicationOutlet[];
  version: number;
  lastUpdated: string;
}

export const defaultThemes: ThemeDefinition[] = [
  { id: 'housing', nameNo: 'Bolig', color: '#ef4444' },
  { id: 'school', nameNo: 'Skole', color: '#f59e0b' },
  { id: 'transport', nameNo: 'Transport', color: '#10b981' },
  { id: 'healthcare', nameNo: 'Helse', color: '#3b82f6' },
  { id: 'environment', nameNo: 'Miljø', color: '#22c55e' },
  { id: 'economy', nameNo: 'Økonomi', color: '#8b5cf6' },
  { id: 'culture', nameNo: 'Kultur', color: '#ec4899' },
  { id: 'labor', nameNo: 'Arbeidsliv', color: '#f97316' },
  { id: 'other', nameNo: 'Annet', color: '#6b7280' }
];

export const defaultStrategies: StrategyDefinition[] = [
  { id: 'progressive', nameNo: 'Progressiv', color: '#10b981' },
  { id: 'moderate', nameNo: 'Moderat', color: '#f59e0b' },
  { id: 'heavy-left', nameNo: 'Tung venstre', color: '#ef4444' }
];

export const defaultOutlets: PublicationOutlet[] = [
  {
    id: 'aftenposten',
    name: 'Aftenposten',
    supportedThemes: ['housing', 'school', 'transport', 'healthcare', 'environment', 'economy', 'culture', 'labor'],
    supportedStrategies: ['progressive', 'moderate'],
    coverageKrets: [],
    coverageMunicipalities: [],
    coverageCounties: ['oslo'],
    description: 'Norges største avis'
  },
  {
    id: 'klassekampen',
    name: 'Klassekampen',
    supportedThemes: ['labor', 'economy', 'housing', 'environment'],
    supportedStrategies: ['progressive', 'heavy-left'],
    coverageKrets: [],
    coverageMunicipalities: [],
    coverageCounties: ['oslo'],
    description: 'Venstreorientert dagsavis'
  },
  {
    id: 'dagsavisen',
    name: 'Dagsavisen',
    supportedThemes: ['housing', 'school', 'transport', 'healthcare', 'labor'],
    supportedStrategies: ['progressive', 'moderate'],
    coverageKrets: [],
    coverageMunicipalities: [],
    coverageCounties: ['oslo'],
    description: 'Sosialdemokratisk orientert'
  }
];
