import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

const EnlaceDocumentoModal = ({
  open,
  onClose,
  tournament,
  onUpdated,
  isAdmin = false,
  label = "Enlace",
  fieldName = "rulesUrl",
  patchService,
  dialogTitle = "Editar documento",
}) => {
  const [url, setUrl] = useState(tournament?.[fieldName] || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  React.useEffect(() => {
    setUrl(tournament?.[fieldName] || "");
  }, [tournament, fieldName]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await patchService(tournament._id, url);
      setSuccess("Enlace actualizado");
      onUpdated && onUpdated(url);
    } catch (e) {
      setError(e.response?.data?.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await patchService(tournament._id, "");
      setUrl("");
      setSuccess("Enlace eliminado");
      onUpdated && onUpdated("");
      setConfirmDeleteOpen(false);
    } catch (e) {
      setError(e.response?.data?.message || "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToUrl = () => {
    if (url) window.open(url, "_blank");
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isAdmin ? dialogTitle : `Ver ${label.toLowerCase()}`}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label={label}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
              placeholder="https://..."
              disabled={loading || !isAdmin}
              sx={{ mt: 1 }}
            />
            <Box display="flex" gap={1}>
              {isAdmin ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading || !url}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setConfirmDeleteOpen(true)}
                    disabled={loading || !tournament?.[fieldName]}
                  >
                    Eliminar
                  </Button>
                </>
              ) : null}
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<OpenInNewIcon />}
                onClick={handleGoToUrl}
                disabled={!url}
              >
                Ir al enlace
              </Button>
            </Box>
          </Box>
          {isAdmin && (
            <Typography variant="body2" color="text.secondary" mt={2}>
              Deja el campo vacío y guarda para eliminar el enlace.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Cerrar
          </Button>
        </DialogActions>
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess("")}
        >
          <Alert severity="success">{success}</Alert>
        </Snackbar>
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError("")}
        >
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </Dialog>
      {/* Confirmación de eliminación */}
      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        handleClose={() => setConfirmDeleteOpen(false)}
        handleConfirm={handleDelete}
        deleting={loading}
        entityName={label.toLowerCase()}
        confirmButtonColor="error"
      />
    </>
  );
};

export default EnlaceDocumentoModal; 