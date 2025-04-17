import { useState } from "react";
import { Formik, Form } from "formik";
import {
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import TournamentFormFields from "./TournamentFormFields";
import { tournamentValidationSchema } from "../utils/validationSchema";
import { getSportRules } from "../services/sportService";

import BasketballRules from "./sportsRules/BasketballRules";
import SoccerRules from "./sportsRules/SoccerRules";
import VolleyballRules from "./sportsRules/VolleyballRules";
import FutsalRules from "./sportsRules/FutsalRules";

const rulesComponents = {
  Baloncesto: BasketballRules,
  Fútbol: SoccerRules,
  Voleibol: VolleyballRules,
  "Fútbol Sala": FutsalRules,
};

const TournamentForm = ({ sports, onSubmit }) => {
  const [selectedSport, setSelectedSport] = useState(null);
  const [_defaultRules, setDefaultRules] = useState(null);
  const [customRules, setCustomRules] = useState(null);
  const [loadingRules, setLoadingRules] = useState(false);

  const handleSportChange = async (event, handleChangeFormik) => {
    const sportId = event.target.value;
    handleChangeFormik(event);

    const selected = sports.find((s) => s._id === sportId);
    setSelectedSport(selected);

    if (selected) {
      try {
        setLoadingRules(true);
        const data = await getSportRules(sportId);
        setDefaultRules(data.defaultRules || null);
        setCustomRules(data.defaultRules || null);
      } catch (error) {
        console.error("Error fetching sport rules:", error);
        setDefaultRules(null);
        setCustomRules(null);
      } finally {
        setLoadingRules(false);
      }
    }
  };

  const SportRulesComponent = selectedSport
    ? rulesComponents[selectedSport.name]
    : null;

  return (
    <Formik
      initialValues={{
        name: "",
        description: "",
        sport: "",
        format: "",
        registrationStart: "",
        registrationEnd: "",
        startDate: "",
        endDate: "",
        maxTeams: "",
        minPlayersPerTeam: "",
        maxPlayersPerTeam: "",
      }}
      validationSchema={tournamentValidationSchema}
      onSubmit={(values, actions) => {
        const formData = {
          ...values,
          customRules,
        };
        onSubmit(formData, actions);
      }}
    >
      {({
        errors,
        touched,
        isSubmitting,
        values,
        handleChange,
        handleBlur,
      }) => (
        <Form className="flex flex-col gap-6">
          {errors.form && <Alert severity="error">{errors.form}</Alert>}

          <TournamentFormFields
            sports={sports}
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleSportChange={handleSportChange}
          />

          <Box className="mt-6">
            {loadingRules ? (
              <Box className="flex justify-center py-4">
                <CircularProgress />
              </Box>
            ) : (
              SportRulesComponent &&
              customRules && (
                <>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Reglas de {selectedSport?.name}
                  </Typography>
                  <SportRulesComponent
                    rules={customRules}
                    editable={true}
                    onChange={(updatedRules) => setCustomRules(updatedRules)}
                  />
                </>
              )
            )}
          </Box>

          <Box
            className="w-full"
            sx={{ display: "flex", justifyContent: "center", mt: 2 }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ bgcolor: "#35944b", fontSize: "1rem" }}
            >
              Crear Torneo
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default TournamentForm;
