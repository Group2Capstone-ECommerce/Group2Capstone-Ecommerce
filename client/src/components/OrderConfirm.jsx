import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';
import { useAuth } from "../components/AuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OrderConfirm ({createdOrder}) {
    const ORDER_ITEMS_API_URL = "http://localhost:3000/api/order/items";
    const ORDER_API_URL = "http://localhost:3000/api/order";
    const Billing_Info_API_URL = "http://localhost:3000/api//users/billin_info/me";

    const navigate = useNavigate();
    
    const [billingInfo, setBillingInfo] = useState(null)

    const { token } = useAuth();
    if (!token) {
        toast.warn('You must be logged in to view your order.')
    }

    const orderId = createdOrder?.order.id
    if (!orderId) {
        toast.warn('Order ID is missing.')
    }

    console.log("order id =>", orderId)

    const [orderItems, setOrderItems] = useState([])
    const [orderCheckedout, setOrderCheckedout] = useState(false)

    useEffect(()=> {
        const fetchOrderItems = async() => {
            try {
                const response = await fetch(`${ORDER_ITEMS_API_URL}/${orderId}`, {
                    method:'GET',
                    headers:{
                        Authorization: `Bearer ${token}`,
                    },
                })
                const data = await response.json()
                if(!response.ok) {
                    toast.error(data.message)
                }
                console.log('fetch order item data =>', data)
                setOrderItems(data)

                
            } catch (error) {
                console.error('Error fetching order items:', error)
            }
        }
        console.log('Order items =>', orderItems)
        fetchOrderItems();
        fetchBillInfo();
    }, [orderId, orderCheckedout])

    //calculate total itmes quantity
    const calculateQty = () => {
        if (!orderItems || orderItems.length === 0) {
            return 0
        }
        const totalQty = orderItems?.reduce((acc, item) => {
            return acc + item.quantity
        }, 0)
        console.log("Total quantity is:", totalQty);
        return totalQty;
    }

    //calculate order total price 
    const calculateTotalPrice = () => {
        if (!orderItems || orderItems.length === 0) {
            return 0
        }
        const totalPrice = orderItems?.reduce((acc, item) => {
            return acc + (item.price_at_purchase * item.quantity)
        },0)
        return totalPrice
    }

    //fetch user's billing info
    const fetchBillInfo = async() => {
        const response = await fetch (Billing_Info_API_URL)
        const result = await response.json()
        if(!response.ok) {
            setBillingInfo(result.message)
        }
        setBillingInfo(result)
    }

    const handleConfirm = async(e) => {
        e.preventDefault()
        const placeOrder = await fetch(`${ORDER_API_URL}/${orderId}`, {
            method:'PUT',
            headers:{
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })
        const result = await placeOrder.json()
        if(!placeOrder.ok){
            console.error(result.message)
        }
        toast.success(result.message)
        setOrderCheckedout(true)
    }

    return(
        <>
            {orderCheckedout ? (
                <div className="successContainer">
                    <h2>You have palcad order succussfully!</h2>
                    <button onClick={() => navigate('/')}>Go back</button>
                </div>
            ) : (
            <div className="orderContainer" style={{margin: "100px"}}>
                {!billingInfo || !billingInfo.info ? 
                (
                    <div className="shippingInfo">
                        <h3>No Shipping Info</h3>
                        <button>Update Shipping Info</button>
                    </div>
                ) : (
                    <div className="shippingInfo">
                    <h3>Shipping Info:</h3>
                    <p>Name: {billingInfo?.info.full_name}</p>
                    <p>Address:  {billingInfo?.info.address_line1 || billingInfo?.address_line2}</p>
                    <p>Phone:  {billingInfo?.info.phone}</p>
                    <p>Email:  {billingInfo?.info.email}</p>
                </div>
                )}
                {orderItems.length === 0 ? (
                    <p>Loading order...</p>
                ) : (
                    orderItems?.map((item) => {
                        console.log(item);
                        return (
                            <div key={item.id} id={item.id} className="orderCard">
                            <img
                                src={item.image_url || stockImage}
                                alt={item.product_name}
                            />
                            <p><b>{item.product_name}</b></p>
                            <p><b>Qty: {item.quantity}</b></p>
                            <p><b>${item.price_at_purchase}</b></p>
                        </div>
                        )
                    })
                )}
                <div className="orderActions">
                    <p>Checking out items: {calculateQty()} </p>
                    <p>Total price: {calculateTotalPrice()}</p>
                    <p>Payment method: handle payment here</p>
                    <button onClick={() => navigate('/cart')}>Go back</button>
                    <button onClick={handleConfirm}>Confirm</button>
                </div>
            </div>
            )}
            
        </>
    )
}