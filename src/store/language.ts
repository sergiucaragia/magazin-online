import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'ro' | 'ru';

type LangState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'ro',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'magazinul-meu-lang' }
  )
);
