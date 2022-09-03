import axios from "axios";

export const api = axios.create({
  /**
   * axios automatically appends the current
   * working  url.
   */
  baseURL: "api",
});
