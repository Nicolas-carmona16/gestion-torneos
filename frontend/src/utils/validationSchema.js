/**
 * @module validationSchema
 * @description Yup validation schemas for user forms.
 */

import * as Yup from "yup";

/**
 * @constant {Yup.ObjectSchema} validationSchema
 * @description Validation schema for user creation form.
 * 
 * Validates:
 * - firstName: required
 * - lastName: required
 * - email: required, valid format
 * - password: required, minimum 6 characters
 * - birthDate: required, must not be in the future
 */
export const validationSchema = Yup.object({
  firstName: Yup.string().required("El nombre es obligatorio"),
  lastName: Yup.string().required("El apellido es obligatorio"),
  email: Yup.string()
    .matches(/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,4}$/, "Correo inválido")
    .required("El email es obligatorio"),
  password: Yup.string()
    .min(6, "Debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
  birthDate: Yup.date()
    .max(new Date(), "La fecha no puede ser mayor a la actual")
    .required("Fecha obligatoria"),
});

/**
 * @constant {Yup.ObjectSchema} validationSchemaEdit
 * @description Validation schema for editing user birth date.
 * 
 * Validates:
 * - birthDate: required, must not be in the future
 */
export const validationSchemaEdit = Yup.object({
  birthDate: Yup.date()
    .max(new Date(), "La fecha no puede ser mayor a la actual")
    .required("Fecha obligatoria"),
});
