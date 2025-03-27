import * as Yup from "yup";

export const validationSchema = Yup.object({
  firstName: Yup.string().required("El nombre es obligatorio"),
  lastName: Yup.string().required("El apellido es obligatorio"),
  email: Yup.string()
    .matches(/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,4}$/, "Correo inválido")
    .required("El email es obligatorio"),
  password: Yup.string()
    .min(6, "Debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
  birthDate: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato inválido (YYYY-MM-DD)")
    .required("Fecha obligatoria"),
});
