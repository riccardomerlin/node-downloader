function throwError(methodName, error, option) {
  const status = error.status || error.response ? error.response.status : '<no status>';
  error.message = `API Error HTTP ${status} - ${methodName} - ${error.message}${option ? `, additional infos: ${option}` : ''}`;
  throw error;
}

module.exports = throwError;
