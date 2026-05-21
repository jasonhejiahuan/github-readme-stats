// @ts-check

/**
 * Send GraphQL request to GitHub API.
 *
 * @param {any} data Request data.
 * @param {Record<string, string>} headers Request headers.
 * @returns {Promise<any>} Request response.
 */
const request = async (data, headers = {}) => {
  const response = await fetch(
    "https://api.github.com/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    },
  );

  const responseData = await response.json();

  return {
    data: responseData,
    status: response.status,
    statusText: response.statusText,
  };
};

export { request };
export default request;
