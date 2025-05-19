import axios from 'axios';

const fetchService = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5050',
  withCredentials: true,
});

export default fetchService;
