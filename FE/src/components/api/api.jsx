// api.js
import axios from 'axios';


export const fetchCompanies = async () => {
    const response = await axios.get('http://127.0.0.1:8000/infor/companies-data');
    return response.data;
}
