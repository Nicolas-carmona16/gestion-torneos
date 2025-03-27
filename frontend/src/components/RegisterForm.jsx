import { useState } from "react";
import { Formik, Form } from "formik";
import { Button, Typography, Alert, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { validationSchema } from "../utils/validationSchema";
import FormTextField from "./FormTextFields";

const RegisterForm = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");

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
        {({ errors, touched, isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            {errors.form && <Alert severity="error">{errors.form}</Alert>}

            <FormTextField
              name="firstName"
              label="Nombre"
              errors={errors}
              touched={touched}
            />
            <FormTextField
              name="lastName"
              label="Apellido"
              errors={errors}
              touched={touched}
            />
            <FormTextField
              name="birthDate"
              label="Fecha de Nacimiento"
              type="date"
              errors={errors}
              touched={touched}
            />
            <FormTextField
              name="email"
              label="Correo Electrónico"
              type="email"
              errors={errors}
              touched={touched}
            />
            <FormTextField
              name="password"
              label="Contraseña"
              type="password"
              errors={errors}
              touched={touched}
            />

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
