import { API_URL } from "../constants/config";
import axios from "axios";

const user_data = JSON.parse(localStorage.getItem("user_bibiara_app"));

const logout = () => {
    localStorage.removeItem('user');
}

const login = (data) => {
    return axios.post(`${API_URL}/login`, data)
            
}

const retrieveSalesOrders = () => {
    const user_data = JSON.parse(localStorage.getItem("user_bibiara_app"));
    let user_id = user_data.user_id;
    let client_id = user_data.client_id;
    const data = {
        user_id,
        client_id
    }
    return axios.post(`${API_URL}/pos/get-sales`, data)
}

const getProducts = (orderId, productName) => {
    return axios.post(`${API_URL}/inventory/search-client-depot-stock?filter=${productName}&order_id=${orderId}`, user_data)   
}

const getUserCart = () => {
    return axios.post(`${API_URL}/pos/get-user-cart/`, user_data)
}

const getCartEntries = (orderId) => {
    return axios.post(`${API_URL}/pos/get-cart-entries?order_id=${orderId}`, user_data)
}

export const apiService = {
    login,
    logout,
    retrieveSalesOrders,
    getUserCart,
    getCartEntries,
    getProducts
};