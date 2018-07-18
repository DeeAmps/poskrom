import { GET_SALES_ORDERS, GET_SALES_ORDERS_ERR } from "../constants/actionTypes";

const salesOrdersReducer = (state = [], action) =>{
    switch (action.type) {
        case GET_SALES_ORDERS:
            return {
                success: true,
                orders : action.orders
            }
        case GET_SALES_ORDERS_ERR:
            return []
        default:
            return state;
    }
}


export default salesOrdersReducer;