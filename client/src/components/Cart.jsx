//Build shopping cart page

// Page /cart
// Displays each product from user's cart
// Include name, quantity of each item
// Display cart total
// Include button to proceed to checkout
// Fetches GET /api/cart

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';
import { useAuth } from "../components/AuthContext.jsx";

export default function Cart() {
    const navigate = useNavigate()
    const [cartItems, setCartItems] = useState(null)
    const [selectedItems, setSelectedItems] = useState([]);
    const Cart_API_URL = 'http://localhost:3000/api/cart';
    const { token } = useAuth();
    console.log('token is =>', token)

    //select or cancle select single cart item
    const toggleSelect = (productId) => {
        setSelectedItems((prevItem) => 
            prevItem.includes(productId) ? 
            prevItem.filter(prevItemId => prevItemId !== productId) : 
            [...prevItem, id])
    }

    //calculate total price
    const calculateTotal = () => {
        const selectedProducts = cartItems.filter(item => selectedItems.includes(item.id));
        return selectedProducts.reduce((total, item) => total + item.price, 0);
    };

    //select all cart items
    const selectAll = () => {
        const allIds = cartItems.map(item => item.id);
        setSelectedItems(allIds);
    };

    //cancle select all
    const clearAll = () => {setSelectedItems([]);};

    //handle checkout; 
    const handleCheckout = async(e) => {
        e.preventDefault()
        const selectedProducts = cartItems.filter(item => selectedItems.includes(item.id));
        console.log("selected items' price is => ", selectedProducts);
        console.log("total price is => ", calculateTotal());
        //fetch with creating order api
        const createOrder = await fetch()
    };

    //fetch cart items API to get user's cart info
    useEffect(() => {
        const fetchCart = async() => {
            try {
                const response = await fetch(Cart_API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const data = await response.json();
                console.log('Cart items data is =>', data)
                setCartItems(data)
            } catch (error) {
                console.error('Error getting cart items...')
            }
        };
        fetchCart()
    }, [])
    return (
        <>
            {!token && (
                <div>
                    <p>Login/Register to explore more!</p>
                    <Link to={'/login'}>
                        <button className="loginButton">Login</button>
                    </Link>
                    <Link>
                        <button className="registerButton">Register</button>
                    </Link>
                </div>
            )}
            <div className="cartItemsContainer">
                <h2>🛒 My Cart</h2>
                {!cartItems ? (
                    <p>Empty cart...Let's pick up something you like!</p>
                    ) : (
                    cartItems.map((cartItem) => 
                        <div key={cartItem.product_id} id={cartItem.product_id} className="cartCard">
                            <ul type='checkbox'>
                                <li>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(cartItem.id)}
                                    onChange={() => toggleSelect(cartItem.id)}
                                />
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