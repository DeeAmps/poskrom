import { } from "../constants/actionTypes";
import { apiService } from "../services/api";


const getProducts = (products) =>{
    return {
        type: GET_PRODUCT,
        products
                
    }
}
    
export const searchProduct = (orderId, productName) => {
    return (dispatch) => {
        return apiService.getProducts(orderId, productName)
        .then(response => {
            console.log(response);
            // if(!response.data.error_message){
            //     dispatch(getProducts(response.data));  
            // }
        })
        .catch(err => {
            console.log("Error", err);
        });       
    }
}
    
    