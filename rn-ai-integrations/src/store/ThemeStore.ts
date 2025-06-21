import { create } from 'zustand'

type ColorTheme = 'light' | 'dark'

type ThemeStore = {
  colorTheme: ColorTheme
  setColorTheme: (colorTheme: ColorTheme) => void
}

const useThemeStore = create<ThemeStore>((set) => ({
  colorTheme: 'dark',

  setColorTheme: (colorTheme) => set({ colorTheme }),
}))

export { useThemeStore }
