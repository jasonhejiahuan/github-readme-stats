// @ts-check

import { CustomError } from "./error.js";
import { logger } from "./log.js";

/**
 * @typedef {import("axios").AxiosResponse} AxiosResponse Axios response.
 * @typedef {(variables: any, token: string, retriesForTests?: number) => Promise<AxiosResponse>} FetcherFunction Fetcher function.
 */

/**
 * Try to execute the fetcher function until it succeeds or the max number of retries is reached.
 *
 * @param {FetcherFunction} fetcher The fetcher function.
 * @param {any} variables Object with arguments to pass to the fetcher function.
 * @param {string} token GitHub token.
 * @param {number} retries How many times to retry.
 * @returns {Promise<any>} The response from the fetcher function.
 */
const retryer = async (
  fetcher,
  variables,
  token,
  retries = 0,
) => {
  if (!token) {
    throw new CustomError(
      "No GitHub API token found",
      CustomError.NO_TOKENS,
    );
  }

  if (retries > 7) {
    throw new CustomError(
      "Downtime due to GitHub API rate limiting",
      CustomError.MAX_RETRY,
    );
  }

  try {
    let response = await fetcher(
      variables,
      token,
      retries,
    );

    const errors = response?.data?.errors;
    const errorType = errors?.[0]?.type;
    const errorMsg = errors?.[0]?.message || "";

    const isRateLimited =
      (errors && errorType === "RATE_LIMITED") ||
      /rate limit/i.test(errorMsg);

    if (isRateLimited) {
      logger.log("GitHub API rate limited");

      retries++;

      return retryer(
        fetcher,
        variables,
        token,
        retries,
      );
    }

    return response;
  } catch (err) {
    /** @type {any} */
    const e = err;

    if (!e?.response) {
      throw e;
    }

    const isBadCredential =
      e?.response?.data?.message ===
      "Bad credentials";

    const isAccountSuspended =
      e?.response?.data?.message ===
      "Sorry. Your account was suspended.";

    if (
      isBadCredential ||
      isAccountSuspended
    ) {
      logger.log("GitHub token failed");

      throw new CustomError(
        "GitHub token invalid",
        CustomError.NO_TOKENS,
      );
    }

    return e.response;
  }
};

const RETRIES = 7;

export { retryer, RETRIES };
export default retryer;
