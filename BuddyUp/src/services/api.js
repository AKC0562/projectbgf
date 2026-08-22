import axios from 'axios'
import { setupResponseInterceptor } from './interceptor/responceInterceptor'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL|| "https://localhost:5000/api",
    headers:{
        "Content-Type" : "application/json"
    }
})

setupResponseInterceptor(api)

export default api