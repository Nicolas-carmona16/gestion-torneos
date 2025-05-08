import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import {
  Button,
  Typography,
  Alert,
  Container,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import FormTextField from "../FormTextFields";

/**
 * @module LoginForm
 * @component
 * @description Login form component that allows users to sign in with their email and password.
 *              It uses Formik for form state management and displays error or success messages accordingly.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.setIsAuthenticated - Function to set the authenticated state after successful login.
 *
 * @returns {JSX.Element} A login form with input fields, validation feedback, and loading state.
 *
 * @example
 * <LoginForm setIsAuthenticated={setAuth} />
 */
const LoginForm = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 10, p: 6, bgcolor: "white", boxShadow: 5, borderRadius: 4 }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        color="#026937"
        fontWeight="bold"
      >
        Iniciar Sesión
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values, { setSubmitting }) => {
          setMessage({ text: "", type: "" });

          try {
            await loginUser(values);
            setIsAuthenticated(true);
            setMessage({
              text: "¡Inicio de sesión exitoso! Redirigiendo...",
              type: "success",
            });

            setTimeout(() => navigate("/"), 2000);
          } catch {
            setMessage({
              text: "Correo o contraseña incorrectos",
              type: "error",
            });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            <FormTextField
              name="email"
              label="Correo Electrónico"
              type="email"
              disabled={isSubmitting}
            />
            <FormTextField
              name="password"
              label="Contraseña"
              type="password"
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ bgcolor: "#35944b", fontSize: "1rem" }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default LoginForm;
