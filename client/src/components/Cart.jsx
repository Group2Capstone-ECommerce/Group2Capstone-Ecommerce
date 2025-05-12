//Build shopping cart page


import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';
import { useAuth } from "../components/AuthContext.jsx";
import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import './CSS/cart.css'

export default function Cart({setCreatedOrder}) {
    const [cartItems, setCartItems] = useState([])
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const navigate = useNavigate()
    const [refreshCart, setRefreshCart] = useState(false);
    const Cart_API_URL = 'http://localhost:3000/api/cart';
    const Create_Order_API_URL = 'http://localhost:3000/api/order/create';
    const { token } = useAuth();
    //console.log('token is =>', token)

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
                setCartItems(data || [])
            } catch (error) {
                console.error('Error getting cart items...', error)
            }
        };
        fetchCart()
    }, [refreshCart])

    //Change the quantity of a product in my cart.
    const handleEditQuantity = async(itemId, newQuantity) => {
        try {
            
            const response = await fetch(`${Cart_API_URL}/${itemId}`,{
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json',  
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            })
            if(response.ok) {
                const data = await response.json()
                console.log('New quantity =>', data)
                setRefreshCart(prev => !prev)
            }  else {
                toast.error('Failed to edit quantity', response.status)
                console.error('Failed to edit quantity', response.status);
            }
        } catch (error) {
            console.error(error)
        }
    }

    //Add quantity ++
    const quantityAdd = async(itemId, itemQuantity) => {
        try {
            const response = await fetch(`${Cart_API_URL}/${itemId}`,{
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json',  
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: itemQuantity + 1})
            })
            if(response.ok) {
                const data = await response.json()
                console.log('New quantity =>', data)
                setRefreshCart(prev => !prev)
            }  else {
                console.error('Failed to edit quantity', response.status);
            }
        } catch (error) {
            console.error(error)
        }
    }

    //Minus quantity --
    const quantityMinus = async(itemId, itemQuantity) => {
        try {
            if (itemQuantity <= 1) {
              toast.warn('Quantity cannot be less than 1');
              return;
            }
        
            const response = await fetch(`${Cart_API_URL}/${itemId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ quantity: itemQuantity - 1 })
            });
        
            if (response.ok) {
              const data = await response.json();
              console.log('New quantity =>', data);
              setRefreshCart(prev => !prev);
            } else {
                console.error('Failed to minus quantity', response.status);
            }
        } catch (error) {
            console.error('Error minus quantity', error);
        }
    }

    //Remove a product from my cart.
    const handleDelete = async(itemId) => {
        console.log('Trying to delete', itemId);
        try {
            const response = await fetch(`${Cart_API_URL}/${itemId}`,{
                method: 'DELETE',
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            if(response.ok) {
                console.log('response is =>', response)
                toast.success('Item deleted!')
                setRefreshCart(prev => !prev)
            } else {
                console.error('Delete failed:', response.statusText);
            }
        } catch (error) {
            console.log('Error deleting item', error)
        }
    }

    //select or cancle select single cart item
    const toggleSelect = (productId) => {
        setSelectedItems((prevItem) => 
            prevItem.includes(productId) ? 
            prevItem.filter(prevItemId => prevItemId !== productId) : 
            [...prevItem, productId])
    }

    //calculate total price
    const calculateTotal = () => {
        return cartItems
          .filter((item) => selectedItems.includes(item.product_id))
          .reduce((total, item) => total + item.price * item.quantity, 0)
          .toFixed(2);
      };

    //handle select/unselect  all cart items
    const handleSelectAll = () => {
        if (selectAll) {
          setSelectedItems([]);
        } else {
          setSelectedItems(cartItems?.map((item) => item.product_id));
        }
        setSelectAll(!selectAll);
      };
    

    //handle checkout; checking out with a simple confirmation page.
    const handleCheckout = async(e) => {
        e.preventDefault()
        const selectedProducts = cartItems.filter(item => selectedItems.includes(item.product_id));
        console.log("selected items => ", selectedProducts);
        console.log("total price is => ", calculateTotal());
        if(selectedProducts.length === 0 ) {
            console.log('⚠️ No items selected');
            toast.warn('Please select the items to check out!')
            return;
        }
        //fetch with creating order api
        const createOrder = await fetch(Create_Order_API_URL,{
            method: 'POST',
            headers:{
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                totalPrice: calculateTotal(),
                selectedProducts
            }),
        })
        const order = await createOrder.json()
        console.log('order is =>', order)
        if(!createOrder.ok){
            throw new Error(order.error || 'Order creation failed.');
        }
        setCreatedOrder(order)
        //toast.success('Redirecting to confirm order!')
        //setCreatedOrder(order)
        setRefreshCart(prev => !prev)
        //return order.message

        //navigate to order confirm page
        navigate('/order/confirmation')
    };
    //console.log('createdOrder =>', CreatedOrder)

    return (
        <>
            <div className="pageWrapper">
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
            {token && (
                <div className="cartItemsContainer">
                    <h3>🛒Products in My Cart: {cartItems.length}</h3>
                    {!cartItems.length ? (
                        <p>Empty cart...Let's shop something you like!</p>
                        ) : (
                        cartItems?.map((item) => 
                            <div key={item.product_id} className="cartCard">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item.product_id)}
                                    onChange={() => toggleSelect(item.product_id)}
                                />
                                <img
                                    src={item.image_url || stockImage}
                                    alt={item.product_name}
                                />
                                    <Link to={`/products/${item.product_id}`}>
                                        <h4>{item.product_name}</h4>
                                    </Link>
                                    <div className="quantity-control">
                                        {/* {<label>Quantity: </label>} */}
                                        <button 
                                            className='quantityEditButton' 
                                            onClick={()=> quantityAdd(item.product_id, item.quantity)}>
                                            + 
                                        </button>
                                        <input
                                            type="number"
                                            className="quantityInput"
                                            value={item.quantity}
                                            onChange={(e) => handleEditQuantity(item.product_id, parseInt(e.target.value))}
                                        />
                                        <button 
                                            className='quantityEditButton' 
                                            onClick={()=> quantityMinus(item.product_id, item.quantity)}> 
                                            - 
                                        </button>
                                    </div>
                                    <p>Price: ${item.price}</p>
                                    <button 
                                        className="delete" 
                                        onClick={() => handleDelete(item.product_id)}> 
                                        Delete 
                                    </button>
                            </div>
                        )
                    )}
                </div>
            )}
            {cartItems.length > 0 && (
                <div className="cartActions">
                    <button onClick={handleSelectAll} disabled={cartItems.length === 0}>
                        {selectAll ? "Unselect All" : "Select All"}
                    </button>

                    <p>Total Price: ${calculateTotal()}</p>

                    <button 
                        onClick={handleCheckout} 
                        disabled={selectedItems.length === 0}>
                        Checkout
                    </button>
                </div>
            )}
            </div>

        </>
    )

}