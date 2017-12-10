async function callApi(endpoint, functionName, params) {
  let result;

  try {
    if (Array.isArray(params)) {
      result = await endpoint[functionName](...params);
    } else {
      result = await endpoint[functionName](params);
    }
  } catch (error) {
    const status = error.status || error.response ? error.response.status : '<no status>';
    if (status === 401) {
      console.error(error.message);
      await endpoint.tokenRefresh();
      console.log('===> TOKEN Refreshed! <===');
      result = await callApi(endpoint, functionName, params);
    } else {
      throw error;
    }
  }

  return result;
}

module.exports = callApi;
