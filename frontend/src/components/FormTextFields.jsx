import { Field } from "formik";
import { TextField } from "@mui/material";

const FormTextField = ({ name, label, type = "text", ...props }) => (
  <Field
    name={name}
    as={TextField}
    label={label}
    type={type}
    fullWidth
    InputLabelProps={type === "date" ? { shrink: true } : {}}
    error={props.touched[name] && !!props.errors[name]}
    helperText={props.touched[name] && props.errors[name]}
  />
);

export default FormTextField;
