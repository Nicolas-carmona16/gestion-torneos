import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActions,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { getCarouselImages, uploadCarouselImage, deleteCarouselImage } from "../services/carruselService";

/**
 * @module ManageCarrusel
 * @description Admin page for managing carousel images
 * @returns {JSX.Element} Carousel management interface
 */
const ManageCarrusel = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, imageName: "", imageUrl: "" });
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchImages();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await getCarouselImages();
      setImages(response.images || []);
    } catch {
      showSnackbar("Error al cargar las imágenes del carrusel", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showSnackbar("Por favor selecciona un archivo de imagen válido", "error");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar("El archivo es demasiado grande. Máximo 5MB", "error");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await uploadCarouselImage(selectedFile);
      showSnackbar("Imagen subida exitosamente", "success");
      setUploadDialog(false);
      setSelectedFile(null);
      setPreviewUrl("");
      fetchImages();
    } catch {
      showSnackbar("Error al subir la imagen", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (imageName, imageUrl) => {
    setDeleteDialog({ open: true, imageName, imageUrl });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCarouselImage(deleteDialog.imageName);
      showSnackbar("Imagen eliminada exitosamente", "success");
      setDeleteDialog({ open: false, imageName: "", imageUrl: "" });
      fetchImages();
    } catch {
      showSnackbar("Error al eliminar la imagen", "error");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" color="primary">
            Gestión del Carrusel
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUploadDialog(true)}
            sx={{ backgroundColor: "#35944b" }}
          >
            Agregar Imagen
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" mb={3}>
          Administra las imágenes que se muestran en el carrusel de la página principal.
        </Typography>

        {images.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
            textAlign="center"
          >
            <ImageIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>
              No hay imágenes en el carrusel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Haz clic en "Agregar Imagen" para comenzar
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.url}
                    alt={`Imagen del carrusel ${index + 1}`}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {image.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tamaño: {formatFileSize(image.size)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fecha: {formatDate(image.lastModified)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(image.name, image.url)}
                    >
                      Eliminar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Upload Dialog */}
        <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Subir Nueva Imagen</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="image-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Seleccionar Imagen
                </Button>
              </label>
              
              {previewUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Vista previa:
                  </Typography>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!selectedFile || uploading}
              sx={{ backgroundColor: "#35944b" }}
            >
              {uploading ? <CircularProgress size={20} /> : "Subir"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, imageName: "", imageUrl: "" })}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que quieres eliminar esta imagen del carrusel?
            </Typography>
            {deleteDialog.imageUrl && (
              <img
                src={deleteDialog.imageUrl}
                alt="Imagen a eliminar"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginTop: "16px",
                }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, imageName: "", imageUrl: "" })}>
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default ManageCarrusel;
