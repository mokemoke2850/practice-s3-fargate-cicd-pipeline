import axios from 'axios';
import { BACKEND_URL } from '../config';

export const fetchTitle = () =>
  axios.get(`${BACKEND_URL}/title`).then((res) => res.data);
