import { createTheme } from "@mui/material/styles";

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
