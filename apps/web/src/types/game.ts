export interface DesignGame {
  id: string;
  name: string;
  category: string;
  playersLabel: string;
  minP: number;
  maxP: number;
  activeNow: number;
  isNew: boolean;
  desc: string;
  rules: string[];
  tint: string;
  tintDeep: string;
  isPlayable: boolean;
  supportsBot: boolean;
}
