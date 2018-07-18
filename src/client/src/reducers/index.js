import { combineReducers } from 'redux';
import salesOrdersReducer from "./salesOrdersReducer";
import cartReducer from "./cartReducer";


const rootReducer = combineReducers({
    salesOrdersReducer,
    cartReducer
});
  
export default rootReducer;