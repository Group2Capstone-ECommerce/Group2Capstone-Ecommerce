import { useAuth } from "../components/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function AddToCart({product}) {
    console.log("product is =>", product)
    const { token } = useAuth();
    console.log('token is =>', token)
    const navigate = useNavigate();
    const CARTITEM_API_URL = "http://localhost:3000/api/cart/items";
    const handleAddToCart = async() => {
        try {
            if (!token) {
                alert("You must be logged in to add to cart.");
                navigate("/login");
                return;
            }
            if (!product || !product.id) {
                console.error("Invalid product data");
                return;
            }
            const response = await fetch(CARTITEM_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({productId: product.id, quantity: 1})
            })
            if(response.ok) {
                const data = await response.json()
                console.log('Add item id =>', data)
                alert("✅ Product added to cart!");
            } else {
                const ErrorText = await response.text();
                let error;
                try {
                  error = JSON.parse(ErrorText);
                } catch {
                  error = { error: ErrorText }; // fallback: raw string
                }
                console.log("Error text =>",ErrorText)
                console.log(error)
                alert(`❌ Add to cart failed: ${error.error || "Unknown error"}`);
                return;
            }
        } catch (error) {
            console.error("Unexpected error:", err);
            alert("Something went wrong. Please try again.");
        }
    }

    return (
        <>
            <div>
                <button onClick={handleAddToCart}>Add to Cart</button>
            </div>
        </>
    )
}