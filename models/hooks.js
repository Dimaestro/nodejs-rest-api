const handleValidationError = (err, data, next) => {
  err.status = 400;
  next();
};

module.exports = {
  handleValidationError,
};
