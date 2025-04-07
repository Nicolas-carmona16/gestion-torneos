/**
 * @module theme
 * @description Custom Material UI theme configuration for the application.
 */

import { createTheme } from "@mui/material/styles";

/**
 * @constant {Object} theme
 * @description Defines the application's global theme including colors, typography, and component styles.
 * - Primary color: Dark green (#026937)
 * - Secondary color: Light green (#35944b)
 * - Typography: Times New Roman
 * - Overrides:
 *   - Outlined inputs: green border when focused
 *   - Buttons: custom background and hover shadow
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#026937",
    },
    secondary: {
      main: "#35944b",
    },
  },
  typography: {
    fontFamily: "Times New Roman, serif",
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#35944b",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#35944b",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#026937",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          },
        },
      },
    },
  },
});

export default theme;
