import { useState } from "react";
import { Formik, Form } from "formik";
import { Button, Typography, Alert, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { validationSchema } from "../utils/validationSchema";
import FormTextField from "./FormTextFields";

/**
 * @module RegisterForm
 * @component
 * @description User registration form that collects personal details and credentials,
 *              validates them with Formik and Yup, and handles server-side errors.
 *
 * @param {Object} props - Component props.
 * @param {function} props.setIsAuthenticated - Function to update authentication state on successful registration.
 *
 * @returns {JSX.Element} A registration form UI with validation, error handling, and redirection after success.
 *
 * @example
 * <RegisterForm setIsAuthenticated={setIsAuthenticated} />
 */
const RegisterForm = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * Handles server-side registration errors and maps them to Formik fields.
   *
   * @param {Object} err - Error object from the server.
   * @param {Function} setErrors - Formik method to set form errors.
   */
  const handleErrors = (err, setErrors) => {
    if (err.response?.status === 400) {
      const errorMsg = err.response.data.message;
      if (errorMsg.toLowerCase().includes("user already exists")) {
        setErrors({ email: "Este correo ya está registrado" });
      } else {
        setErrors({ form: errorMsg });
      }
    } else {
      setErrors({ form: "Error inesperado, por favor intente más tarde." });
    }
  };

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
        Registrarse
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          birthDate: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await registerUser(values);
            setIsAuthenticated(true);
            setSuccessMessage("¡Registro exitoso! Redirigiendo...");
            setTimeout(() => {
              navigate("/");
            }, 2000);
          } catch (err) {
            handleErrors(err, setErrors);
            setSubmitting(false);
          }
        }}
      >
        {({ errors, isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            {errors.form && <Alert severity="error">{errors.form}</Alert>}

            <FormTextField name="firstName" label="Nombre" />
            <FormTextField name="lastName" label="Apellido" />
            <FormTextField
              name="birthDate"
              label="Fecha de Nacimiento"
              type="date"
              inputProps={{
                max: new Date().toISOString().split("T")[0],
              }}
            />
            <FormTextField
              name="email"
              label="Correo Electrónico"
              type="email"
            />
            <FormTextField name="password" label="Contraseña" type="password" />

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ bgcolor: "#35944b", fontSize: "1rem" }}
            >
              Registrarse
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default RegisterForm;
