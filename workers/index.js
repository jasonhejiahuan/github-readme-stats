import stats from "../api/index.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api") {
        return await stats(request, env);
      }

      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
          stack: error.stack,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  },
};
