import { useAuth } from "../components/AuthContext.jsx";
import { toast } from "react-toastify";
import "./CSS/addToCart.css"

export default function AddToCart({product}) {
    //console.log("product is =>", product)
    const { token } = useAuth();
    //console.log('token is =>', token)
    const {isAdmin} = useAuth();
    const CARTITEM_API_URL = "https://group2capstone-ecommerce.onrender.com/api/cart/items";
    const handleAddToCart = async() => {
        if (!token) {
            toast.warn(
                "Please log in to add items to your cart.",
            );
            return;
        }
        if (!product || !product.id) {
            toast.error("Invalid product.");
            return;
        }
        try {
            const response = await fetch(CARTITEM_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({productId: product.id, quantity: 1})
            })

            const result = await response.json()

            if (!response.ok) {
                toast.error(result.error || "Failed to add to cart.");
            } else {
                //console.log('In add to cart page, is admin value=>', isAdmin)
                toast.success("✅ Added to cart!");
            }
        } catch (error) {
            console.error("Add to cart error:", error);
            toast.error(`❌ ${error.message}`);
        }
    }

    return (
        <>
            <div>
                <button 
                    className="addToCartBtn"
                    onClick={handleAddToCart} 
                    disabled={token && isAdmin === true}
                >
                    Add to Cart
                </button>
            </div>
        </>
    )
}