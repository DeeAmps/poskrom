import { GET_USER_CART, GET_USER_CART_ERR } from "../constants/actionTypes";

const cartReducer = (state = {}, action) =>{
    switch (action.type) {
        case GET_USER_CART:
            return {
                success: true,
                cart : action.cartResponse
            }
        case GET_USER_CART_ERR:
            return {
                success : false,
                error: action.error
            }
        default:
            return state;
    }
}


export default cartReducer;