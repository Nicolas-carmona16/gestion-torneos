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
export const validationUserSchema = Yup.object({
  firstName: Yup.string().required("El nombre es obligatorio"),
  lastName: Yup.string().required("El apellido es obligatorio"),
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._-]+@udea\.edu\.co$/,
      "Debe ser un correo institucional de la UdeA"
    )
    .required("El correo es obligatorio"),
  password: Yup.string()
    .min(6, "Debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
  sports: Yup.array(),
  tournaments: Yup.array().of(Yup.string()),
});

/**
 * @constant {Yup.ObjectSchema} tournamentValidationSchema
 * @description Validation schema for tournament creation form.
 * validates:
 * - name: required
 * - description: required
 * - sport: required
 * - format: required, one of "group-stage" or "elimination"
 * - registrationStart: required
 * - registrationEnd: required, must be after registrationStart
 * - startDate: required, must be after registrationEnd
 * - endDate: required, must be after startDate
 * - maxTeams: required, minimum 2
 * - minPlayersPerTeam: required, minimum 1
 * - maxPlayersPerTeam: required, must be greater than or equal to minPlayersPerTeam
 */
export const tournamentValidationSchema = Yup.object({
  name: Yup.string().required("El nombre es obligatorio"),
  description: Yup.string().required("La descripción es obligatoria"),
  sport: Yup.string().required("Selecciona un deporte"),
  format: Yup.string()
    .oneOf(["group-stage", "elimination"])
    .required("Selecciona un formato"),
  bestOfMatches: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .required('El campo "Mejor de" es requerido')
    .min(1, "Debe ser al menos 1"),
  isOlympiad: Yup.boolean(),
  registrationStart: Yup.date().required("Inicio de inscripción requerido"),
  registrationTeamEnd: Yup.date()
    .min(Yup.ref("registrationStart"), "Debe ser posterior al inicio")
    .required("Fin de inscripción requerido"),
  registrationPlayerEnd: Yup.date()
    .min(Yup.ref("registrationStart"), "Debe ser posterior al inicio")
    .required("Fin de inscripción requerido"),
  startDate: Yup.date()
    .min(
      Yup.ref("registrationTeamEnd"),
      "Debe ser posterior al fin de inscripción de equipos"
    )
    .required("Fecha de inicio requerida"),
  endDate: Yup.date()
    .min(Yup.ref("startDate"), "Debe ser posterior a la fecha de inicio")
    .required("Fecha de fin requerida"),
  maxTeams: Yup.number().min(2).required("Máximo de equipos requerido"),
  minPlayersPerTeam: Yup.number()
    .min(1)
    .required("Mínimo de jugadores por equipo requerido"),
  maxPlayersPerTeam: Yup.number()
    .min(Yup.ref("minPlayersPerTeam"), "Debe ser mayor o igual al mínimo")
    .required("Máximo de jugadores por equipo requerido"),
});

export const tournamentEditValidationSchema = Yup.object({
  name: Yup.string()
    .nullable()
    .transform((value) => value || null)
    .required("El nombre es obligatorio"),
  description: Yup.string()
    .nullable()
    .transform((value) => value || null)
    .required("La descripción es obligatoria"),
  sport: Yup.string()
    .nullable()
    .transform((value) => value || null)
    .required("Selecciona un deporte"),
  format: Yup.string()
    .nullable()
    .oneOf(["group-stage", "elimination"], "Formato inválido")
    .required("Selecciona un formato"),
  bestOfMatches: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .required('El campo "Mejor de" es requerido')
    .min(1, "Debe ser al menos 1"),
  isOlympiad: Yup.boolean(),
  registrationStart: Yup.date()
    .nullable()
    .typeError("Fecha inválida")
    .required("Inicio de inscripción requerido"),
  registrationTeamEnd: Yup.date()
    .nullable()
    .typeError("Fecha inválida")
    .required("Fin de registro de equipos requerido"),
  registrationPlayerEnd: Yup.date()
    .nullable()
    .typeError("Fecha inválida")
    .required("Fin de registro de jugadores requerido"),
  startDate: Yup.date()
    .nullable()
    .typeError("Fecha inválida")
    .required("Fecha de inicio requerida"),
  endDate: Yup.date()
    .nullable()
    .typeError("Fecha inválida")
    .required("Fecha de fin requerida"),
  maxTeams: Yup.number()
    .typeError("Debe ser un número")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(2, "Mínimo 2 equipos")
    .required("Máximo de equipos requerido"),
  minPlayersPerTeam: Yup.number()
    .typeError("Debe ser un número")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(1, "Mínimo 1 jugador")
    .required("Mínimo de jugadores requerido"),
  maxPlayersPerTeam: Yup.number()
    .typeError("Debe ser un número")
    .transform((value) => (isNaN(value) ? undefined : value))
    .when("minPlayersPerTeam", (minPlayersPerTeam, schema) => {
      return minPlayersPerTeam
        ? schema.min(
            minPlayersPerTeam,
            "Máximo de jugadores debe ser mayor o igual al mínimo"
          )
        : schema;
    })
    .required("Máximo de jugadores requerido"),
});

export const validationTeamRegisterSchema = Yup.object().shape({
  name: Yup.string().required("El nombre del equipo es obligatorio"),
  tournamentId: Yup.string().required(),
  captainExtra: Yup.object().shape({
    idNumber: Yup.string().required("La cédula del capitán es obligatoria"),
    eps: Yup.string().required("La EPS del capitán es obligatoria"),
    career: Yup.string()
      .required("La carrera es obligatorio")
      .oneOf(
        [
          "Bioingeniería",
          "Ingeniería Ambiental",
          "Ingeniería Civil",
          "Ingeniería Eléctrica",
          "Ingeniería Electrónica",
          "Ingeniería Industrial",
          "Ingeniería de Materiales",
          "Ingeniería Mecánica",
          "Ingeniería Química",
          "Ingeniería Sanitaria",
          "Ingeniería de Sistemas",
          "Ingeniería de Telecomunicaciones",
        ],
        "Selecciona una carrera válida"
      ),
  }),
  players: Yup.array().of(
    Yup.object().shape({
      fullName: Yup.string().required("El nombre completo es obligatorio"),
      idNumber: Yup.string()
        .required("La cédula es obligatoria")
        .matches(/^\d+$/, "La cédula solo debe contener números"),
      email: Yup.string()
        .matches(
          /^[a-zA-Z0-9._-]+@udea\.edu\.co$/,
          "Debe ser un correo institucional"
        )
        .required("El correo es obligatorio"),
      eps: Yup.string().required("La EPS es obligatoria"),
      career: Yup.string()
        .required("La carrera es obligatorio")
        .oneOf(
          [
            "Bioingeniería",
            "Ingeniería Ambiental",
            "Ingeniería Civil",
            "Ingeniería Eléctrica",
            "Ingeniería Electrónica",
            "Ingeniería Industrial",
            "Ingeniería de Materiales",
            "Ingeniería Mecánica",
            "Ingeniería Química",
            "Ingeniería Sanitaria",
            "Ingeniería de Sistemas",
            "Ingeniería de Telecomunicaciones",
          ],
          "Selecciona una carrera válida"
        ),
    })
  ),
});

export const validationNewPlayerSchema = Yup.object().shape({
  fullName: Yup.string().required("El nombre completo es obligatorio"),
  idNumber: Yup.string()
    .required("La cédula es obligatoria")
    .matches(/^\d+$/, "La cédula solo debe contener números"),
  email: Yup.string()
    .required("El correo es obligatorio")
    .matches(
      /^[a-zA-Z0-9._-]+@udea\.edu\.co$/,
      "Debe ser un correo institucional"
    ),
  eps: Yup.string().required("La EPS es obligatoria"),
  career: Yup.string()
    .required("La carrera es obligatorio")
    .oneOf(
      [
        "Bioingeniería",
        "Ingeniería Ambiental",
        "Ingeniería Civil",
        "Ingeniería Eléctrica",
        "Ingeniería Electrónica",
        "Ingeniería Industrial",
        "Ingeniería de Materiales",
        "Ingeniería Mecánica",
        "Ingeniería Química",
        "Ingeniería Sanitaria",
        "Ingeniería de Sistemas",
        "Ingeniería de Telecomunicaciones",
      ],
      "Selecciona una carrera válida"
    ),
});
