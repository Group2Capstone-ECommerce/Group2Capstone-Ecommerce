//Build shopping cart page

// Page /cart
// Displays each product from user's cart
// Include name, quantity of each item
// Display cart total
// Include button to proceed to checkout
// Fetches GET /api/cart

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';

export default function Cart({token}) {
    const Cart_API_URL = 'http://localhost:3000/api/cart';

    return (
        <>
         <div>
            <h2>Loading your cart...</h2>
         </div>
        </>
    )

}