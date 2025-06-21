import { vars } from 'nativewind'

export const themes = {
  light: vars({
    '--color-body-default': '#0e1e38',
    '--color-body-second': '#41474f',
    '--color-background-default': '#ffffff',
    '--color-background-second': '#eeeeee',
    '--color-container-default': '#544972',
    '--color-container-second': '#404d86',
    '--color-accent-default': '#8d0f0f',
    '--color-accent-second': '#ffeea9',
    '--color-overlay': 'rgba(255, 255, 255, .3)',
  }),
  dark: vars({
    '--color-body-default': '#bac4d3',
    '--color-body-second': '#5974d2',
    '--color-background-default': '#151414',
    '--color-background-second': '#252525',
    '--color-container-default': '#e3ba64',
    '--color-container-second': '#d77732',
    '--color-accent-default': '#ea2b2b',
    '--color-accent-second': '#ffeea9',
    '--color-overlay': 'rgba(0, 0, 0, .5)',
  }),
}
