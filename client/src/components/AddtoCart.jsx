import { useAuth } from "../components/AuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function AddToCart({product}) {
    //console.log("product is =>", product)
    const { token } = useAuth();
    //console.log('token is =>', token)

    const CARTITEM_API_URL = "http://localhost:3000/api/cart/items";
    const handleAddToCart = async() => {
        if (!token) {
            toast.warning(
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
                <button className="add-cart-button" onClick={handleAddToCart}>Add to Cart</button>
            </div>
        </>
    )
}