const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Not Found - ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: `Internal Server Error - ${err.message}`,
  });
};

export { notFound, errorHandler };
