import { Container, Grid, Button, CircularProgress, Box } from "@mui/material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCarouselImages } from "../services/carruselService";

/**
 * @module Home
 * @description Home page component with navigation buttons and an image carousel.
 * @returns {JSX.Element} Home page layout.
 */
const fallbackImages = [
  "/images/ganadores1.jpg",
  "/images/ganadores2.jpg",
  "/images/ganadores3.jpg",
];

const Home = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await getCarouselImages();
        if (response.success && response.images && response.images.length > 0) {
          setImages(response.images.map((img) => img.url));
        } else {
          setImages(fallbackImages);
        }
      } catch (error) {
        console.error("Error loading carousel images:", error);
        setError("Error al cargar las imágenes del carrusel");
        setImages(fallbackImages);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <Container className="mt-10">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container className="mt-10">
      <Grid container spacing={3} justifyContent="center" alignItems="center">
        <Grid
          size={{ xs: 12 }}
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          {[
            { text: "Inscripciones", path: "/inscripciones" },
            { text: "Equipos", path: "/equipos" },
            { text: "Programación", path: "/programacion" },
            { text: "Estadísticas", path: "/emparejamientos" },
            { text: "Reglamento", path: "/reglamento" },
            { text: "Resoluciones", path: "/resoluciones" },
          ].map(({ text, path }, index) => (
            <Button
              key={index}
              variant="contained"
              style={{
                backgroundColor: "#35944b",
                width: "150px",
                padding: "10px 0",
                fontSize: "16px",
                borderRadius: "15px",
              }}
              component={Link}
              to={path}
            >
              {text}
            </Button>
          ))}
        </Grid>
        <Grid
          size={{ xs: 12 }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <Carousel
            showThumbs={false}
            autoPlay
            infiniteLoop
            interval={3000}
            showStatus={false}
            style={{ width: "100%", maxWidth: "600px" }}
          >
            {images.map((src, index) => (
              <div key={index}>
                <img
                  src={src}
                  alt={`Imagen ${index + 1}`}
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>
            ))}
          </Carousel>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
