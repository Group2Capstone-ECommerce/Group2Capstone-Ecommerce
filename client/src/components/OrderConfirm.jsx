import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';
import { useAuth } from "../components/AuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OrderConfirm({ createdOrder }) {
    const ORDER_ITEMS_API_URL = "http://localhost:3000/api/order/items";
    const ORDER_API_URL = "http://localhost:3000/api/order";
    const MAILING_INFO_API_URL = "http://localhost:3000/api/users/mailing-info";

    const navigate = useNavigate();
    
    const [mailingInfo, setMailingInfo] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [orderCheckedout, setOrderCheckedout] = useState(false);
    const [orderCanceled, setOrderCanceled] = useState(false);
    const [success, setSuccess] = useState('');

    const { token } = useAuth();

    console.log('token!!! ', token);

    if (!token) {
        toast.warn('You must be logged in to view your order.');
    }

    const orderId = createdOrder?.order?.id;
    if (!orderId) {
        toast.warn('Order ID is missing.');
    }

    useEffect(() => {
        if (!token) {
            toast.warn("You must be logged in to view your order.");
            return;
        }

        const fetchOrderItems = async () => {
            try {
            const response = await fetch(`${ORDER_ITEMS_API_URL}/${orderId}`, {
                method: 'GET',
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.message);
            }
            setOrderItems(data);
            } catch (error) {
            console.error('Error fetching order items:', error);
            }
        };

        const fetchMailingInfo = async () => {
            try {
            const response = await fetch(MAILING_INFO_API_URL, {
                method: 'GET',
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            const result = await response.json();
            console.log(result);
            if (!response.ok) {
                toast.error(result.message);
                return;
            }
            setMailingInfo(result.mailingInfo); // fixed
            } catch (err) {
            console.error('Failed to fetch mailing info:', err);
            }
        };

        fetchOrderItems();
        fetchMailingInfo();
    }, [token, orderId, orderCheckedout, orderCanceled]);

    const calculateQty = () => {
        if (!orderItems?.length) return 0;
        return orderItems.reduce((acc, item) => acc + item.quantity, 0);
    };

    const calculateTotalPrice = () => {
        if (!orderItems?.length) return 0;
        return orderItems.reduce((acc, item) => acc + (item.price_at_purchase * item.quantity), 0);
    };

    const handleCancel = async (e) => {
        e.preventDefault();
        const cancelOrder = await fetch(`${ORDER_API_URL}/cancel/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const result = await cancelOrder.json();
        if (!cancelOrder.ok) {
            console.error(result.message);
        }
        setOrderCanceled(true);
        setSuccess(result.message);
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        const placeOrder = await fetch(`${ORDER_API_URL}/confirm/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const result = await placeOrder.json();
        if (!placeOrder.ok) {
            console.error(result.message);
        }
        setSuccess(result.message);
        setOrderCheckedout(true);
    };

    return (
        <>
            {orderCheckedout || orderCanceled ? (
                <div className="successContainer">
                    <h2>{success}</h2>
                    <button onClick={() => navigate('/')}>Go back</button>
                </div>
            ) : (
                <div className="orderContainer" style={{ margin: "100px" }}>
                    {!mailingInfo ? (
                        <div className="shippingInfo">
                            <h3>No Shipping Info</h3>
                            <button>Update Shipping Info</button>
                        </div>
                    ) : (
                        <div className="shippingInfo">
                            <h3>Shipping Info:</h3>
                            <p>Address: {mailingInfo.mailing_address}</p>
                        </div>
                    )}

                    {orderItems.length === 0 ? (
                        <p>Loading order...</p>
                    ) : (
                        orderItems.map((item) => (
                            <div key={item.id} id={item.id} className="orderCard">
                                <img src={item.image_url || stockImage} alt={item.product_name} />
                                <p><b>{item.product_name}</b></p>
                                <p><b>Qty: {item.quantity}</b></p>
                                <p><b>${item.price_at_purchase}</b></p>
                            </div>
                        ))
                    )}

                    <div className="orderActions">
                        <p>Checking out items: {calculateQty()} </p>
                        <p>Total price: ${calculateTotalPrice()}</p>
                        <p>Payment method: handle payment here</p>
                        <button onClick={handleCancel}>Cancel Order</button>
                        <button onClick={handleConfirm}>Confirm</button>
                    </div>
                </div>
            )}
        </>
    );
}
