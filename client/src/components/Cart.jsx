//Build shopping cart page

// Page /cart
// Displays each product from user's cart
// Include name, quantity of each item
// Display cart total
// Include button to proceed to checkout
// Fetches GET /api/cart

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';
import { useAuth } from "../components/AuthContext.jsx";

export default function Cart() {
    const navigate = useNavigate()
    const [cart, setCart] = useState(null)
    const Cart_API_URL = 'http://localhost:3000/api/cart';
    const { token } = useAuth();
    console.log('token is =>', token)
    useEffect(() => {
        const fetchCart = async() => {
            try {
                const response = await fetch(Cart_API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const data = await response.json();
                console.log('Cart data is =>', data)
                setCart(data)
            } catch (error) {
                console.error('Error getting cart items...')
            }
        };
        fetchCart()
    }, [])
    return (
        <>
            <div>
                <button onClick={() => navigate('/')}>Go back</button>
            </div>
            <div className="cartItemsContainer">
                <h2>Your Cart</h2>
                {!cart ? (
                    <p>Empty cart...Let's pick up something you like!</p>
                    ) : (
                    cart.map((cartItem) => 
                        <div key={cartItem.product_id} id={cartItem.product_id} className="cartCard">
                            <ul type='checkbox'>
                                <li>
                                    <img
                                        src={cartItem.image_url || stockImage}
                                        alt={cartItem.product_name}
                                    />
                                    <br/>
                                    {cartItem.product_name}
                                    <br/>
                                    {cartItem.quantity}
                                    <br/>
                                    {cartItem.price}
                                </li>
                            </ul>
                        </div>
                    )
                )}
            </div>
            <div>
                <button>SelectAll</button>
                <p>Total Price: $</p>
                <button>Checkout</button>
            </div>
        </>
    )

}