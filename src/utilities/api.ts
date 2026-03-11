import Path from "./paths";
import axios from "axios";

const Api = axios.create({
  baseURL: `${Path.api}`,
});

export default Api;