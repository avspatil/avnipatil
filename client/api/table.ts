import axios from "axios";

const API = "http://localhost:3001";

export const getTable = async () => {
  const res = await axios.get(`${API}/table`, {
    withCredentials: true
  });
  return res.data;
};