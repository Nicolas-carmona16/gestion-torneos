import { Field } from "formik";
import { TextField } from "@mui/material";

/**
 * @module FormTextField
 * @component
 * @description A reusable form text field component integrated with Formik and MUI's TextField.
 *
 * @param {Object} props - Component props.
 * @param {string} props.name - The name of the field, used by Formik.
 * @param {string} props.label - The label to display above the input.
 * @param {string} [props.type="text"] - The type of the input (e.g., "text", "email", "date").
 * @param {Object} [props.props] - Additional props to pass to the MUI TextField component.
 *
 * @returns {JSX.Element} A Formik-integrated MUI TextField with error handling.
 *
 * @example
 * <FormTextField name="firstName" label="Nombre" />
 * <FormTextField name="birthDate" label="Fecha de Nacimiento" type="date" />
 */
const FormTextField = ({ name, label, type = "text", ...props }) => (
  <Field name={name}>
    {({ field, meta }) => (
      <TextField
        {...field}
        {...props}
        label={label}
        type={type}
        fullWidth
        InputLabelProps={type === "date" ? { shrink: true } : {}}
        error={meta.touched && !!meta.error}
        helperText={meta.touched && meta.error}
      />
    )}
  </Field>
);

export default FormTextField;
