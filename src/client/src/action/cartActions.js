import { GET_USER_CART, GET_USER_CART_ERR } from "../constants/actionTypes";
import { apiService } from "../services/api";

    
const userCartSuccess = (cartResponse) =>{
    return {
        type: GET_USER_CART,
        cartResponse
               
    }
}

const userCartFailure = (error) =>{
    return {
        type: GET_USER_CART_ERR,
        error
    }
}

export const getUserCart = () => {
    return (dispatch) => {
        return apiService.getUserCart()
        .then(response => {
            if(!response.data.error_message){
                dispatch(userCartSuccess(response.data));  
            }
            else {
                dispatch(userCartFailure(response.data.error_message));
            }
        })
        .catch(err => {
            console.log("Error", err);
            dispatch(userCartFailure(err));
        });       
    }
}

export const getProducts = () => {
    apiService.getProducts()
    .then(response => {
        console.log(response);
    })
}