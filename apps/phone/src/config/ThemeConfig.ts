import { ThemeOptions } from '@mui/material';

// Configure all of the phone's default themes here.
export const PhoneThemes: Record<string, ThemeOptions> = {
  'taso-dark': {
    components: {
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: '#262626',
          },
        },
      },
    },
    palette: {
      mode: 'dark',
      primary: {
        main: '#5078D7',
        dark: '#4569C9',
        contrastText: '#FAFAFA',
      },
      error: {
        main: '#DC2626',
      },
      success: {
        main: '#16A34A',
      },
      background: {
        default: '#0A0A0A',
        paper: '#141414',
      },
      divider: '#262626',
      text: {
        primary: '#FAFAFA',
        secondary: '#A3A3A3',
        disabled: '#737373',
      },
    },
  },
  'default-light': {
    typography: {
      fontFamily: "'SegoeUI', 'Roboto', 'Arial', sans-serif",
    },
    palette: {
      mode: 'light',
      primary: {
        main: '#607D8B',
      },
      text: {
        primary: 'rgba(0, 0, 0, 0.9)',
        secondary: 'rgba(20, 20, 20, 0.9)',
        disabled: 'rgba(20, 20, 20, 0.5)',
      },
    },
  },
};
