import React from "react";
import { Container, Grid, Button } from "@mui/material";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Link } from "react-router-dom";

const images = [
  "/images/ganadores1.jpg",
  "/images/ganadores2.jpg",
  "/images/ganadores3.jpg",
];

const Home = () => {
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
            { text: "Cuadros", path: "/cuadros" },
            { text: "Programación", path: "/programacion" },
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
