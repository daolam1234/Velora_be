// utils/response.js
export const createdHandler = (data, message = "Created successfully") => {
  return {
    status: true,
    message,
    data,
    statusCode: 201
  };
};
