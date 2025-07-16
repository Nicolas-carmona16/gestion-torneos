import {
  Box,
  Typography,
  CircularProgress,
  TablePagination,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Download } from "@mui/icons-material";
import { getAllTournaments } from "../services/tournamentService";
import { getAllSports } from "../services/sportService";
import { getUser } from "../services/authService";
import { downloadPlayersExcel } from "../services/playerService";
import FilterTournaments from "./FilterTournaments";
import GenericTournamentTable from "./GenericTournamentTable";
import EnlaceDocumentoModal from "./EnlaceDocumentoModal";
import { patchTournamentRulesUrl } from "../services/tournamentService";
import { patchTournamentResolutionsUrl } from "../services/tournamentService";

const ITEMS_PER_PAGE = 10;

const ManageTablePage = ({ title, actionIcon, actionTooltip, actionRoute }) => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState("");
  const [page, setPage] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [reglamentoModalOpen, setReglamentoModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [modalField, setModalField] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentData, sportsData, userData] = await Promise.all([
          getAllTournaments(),
          getAllSports(),
          getUser(),
        ]);
        setTournaments(tournamentData);
        setFilteredTournaments(tournamentData);
        setSports(sportsData);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      await downloadPlayersExcel();
      setSuccess("Excel descargado exitosamente");
    } catch (error) {
      setError(error.response?.data?.message || "Error al descargar el Excel");
    } finally {
      setDownloading(false);
    }
  };

  // Handler genérico para reglamento y resoluciones
  const handleEnlaceDocumentoClick = (tournament, field) => {
    if (currentUser?.role === "admin") {
      setSelectedTournament(tournament);
      setReglamentoModalOpen(true);
      setModalField(field);
    } else {
      const url = tournament[field];
      if (url) {
        window.open(url, "_blank");
      } else {
        setError(
          field === "rulesUrl"
            ? "Este torneo no tiene reglamento disponible."
            : "Este torneo no tiene resolución disponible."
        );
      }
    }
  };

  // Handler para cerrar el modal
  const handleCloseReglamentoModal = () => {
    setReglamentoModalOpen(false);
    setSelectedTournament(null);
    setModalField(null);
  };

  // Handler para actualizar el reglamento en la lista
  const handleReglamentoUpdated = (newUrl) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t._id === selectedTournament._id ? { ...t, [modalField]: newUrl } : t
      )
    );
    setFilteredTournaments((prev) =>
      prev.map((t) =>
        t._id === selectedTournament._id ? { ...t, [modalField]: newUrl } : t
      )
    );
  };

  useEffect(() => {
    const filtered = tournaments.filter((tournament) => {
      const matchesName = tournament.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSport = selectedSport
        ? tournament.sport?.name === selectedSport
        : true;

      return matchesName && matchesSport;
    });

    setFilteredTournaments(filtered);
    setPage(0);
  }, [searchTerm, selectedSport, tournaments]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const paginatedTournaments = filteredTournaments.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mb={2}
        position="relative"
      >
        <Typography variant="h4" color="primary" fontWeight="bold">
          {title}
        </Typography>
        {currentUser?.role === "admin" && title === "Equipos" && (
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownloadExcel}
            disabled={downloading}
            sx={{ 
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)"
            }}
          >
            {downloading ? "Descargando..." : "Descargar Excel Jugadores"}
          </Button>
        )}
      </Box>

      <FilterTournaments
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        sports={sports}
      />

      {filteredTournaments.length === 0 ? (
        <Typography align="center" mt={4}>
          No se encontraron torneos con los criterios seleccionados.
        </Typography>
      ) : (
        <>
          <GenericTournamentTable
            tournaments={paginatedTournaments}
            actionIcon={actionIcon}
            actionTooltip={actionTooltip}
            actionRoute={actionRoute}
            // Unificado para reglamento y resoluciones
            onActionClick={
              title === "Reglamento"
                ? (t) => handleEnlaceDocumentoClick(t, "rulesUrl")
                : title === "Resoluciones"
                ? (t) => handleEnlaceDocumentoClick(t, "resolutionsUrl")
                : undefined
            }
          />
          <TablePagination
            rowsPerPageOptions={[ITEMS_PER_PAGE]}
            component="div"
            count={filteredTournaments.length}
            rowsPerPage={ITEMS_PER_PAGE}
            page={page}
            onPageChange={handleChangePage}
          />
        </>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
      >
        <Alert
          onClose={() => setSuccess("")}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
      {/* Modal unificado para reglamento y resoluciones */}
      {(title === "Reglamento" || title === "Resoluciones") && selectedTournament && modalField && (
        <EnlaceDocumentoModal
          open={reglamentoModalOpen}
          onClose={handleCloseReglamentoModal}
          tournament={selectedTournament}
          onUpdated={handleReglamentoUpdated}
          isAdmin={currentUser?.role === "admin"}
          label={modalField === "rulesUrl" ? "Enlace al reglamento" : "Enlace a la resolución"}
          fieldName={modalField}
          patchService={modalField === "rulesUrl" ? patchTournamentRulesUrl : patchTournamentResolutionsUrl}
          dialogTitle={modalField === "rulesUrl" ? "Editar reglamento" : "Editar resolución"}
        />
      )}
    </Box>
  );
};

export default ManageTablePage;
