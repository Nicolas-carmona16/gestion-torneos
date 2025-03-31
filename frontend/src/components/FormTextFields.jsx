import { Field } from "formik";
import { TextField } from "@mui/material";

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
