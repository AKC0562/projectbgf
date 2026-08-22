export const setupResponseInterceptor = (api) => {
  api.interceptors.response.use(
    (response) => response,

    (error) => {
      if (error.response) {
        const { status } = error.response;

        switch (status) {
          case 400:
            console.error("Bad Request");
            break;

          case 401:
            console.error("Unauthorized");
            break;

          case 403:
            console.error("Forbidden");
            break;

          case 404:
            console.error("Resource Not Found");
            break;

          case 409:
            console.error("Conflict");
            break;

          case 422:
            console.error("Validation Error");
            break;

          case 429:
            console.error("Too Many Requests");
            break;

          case 500:
            console.error("Server Error");
            break;

          default:
            console.error("API Error:", status);
        }
      } else if (error.request) {
        console.error("Server is unreachable");
      } else {
        console.error("Request Error:", error.message);
      }

      return Promise.reject(error);
    }
  );
};