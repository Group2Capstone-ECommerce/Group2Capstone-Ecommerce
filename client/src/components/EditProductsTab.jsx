import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext.jsx";
import stockProductImg from '../assets/stockProductImg.png';

export default function EditProductsTab() {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ 
        product_name: "", 
        price: "", 
        descriptions: "", 
        image_url: "", 
        stock_quantity: ""
    });

    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({
        product_name: "", 
        price: "", 
        descriptions: "", 
        image_url: "", 
        stock_quantity: ""
    });
        
    const ADMIN_PRODUCTS_URL = "http://localhost:3000/api/admin/products";

    useEffect(() => {
        if (!isAdmin) return;
    
        const fetchProducts = async () => {
          try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token is missing.");
    
            const res = await fetch(ADMIN_PRODUCTS_URL, {
              headers: { Authorization: `Bearer ${token}` },
            });
    
            if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
            const data = await res.json();
            setProducts(data);
          } catch (err) {
            console.error("Error fetching products:", err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchProducts();
      }, [isAdmin]);
    
    const handleDelete = async (productId) => {
        const confirmed = window.confirm("Are you sure you want to delete this product?");
        if (!confirmed) return; //Cancel deletion

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${ADMIN_PRODUCTS_URL}/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setProducts(products.filter((p) => p.id !== productId));
            }
        } catch (err) {
            console.error("Failed to delete product", err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(ADMIN_PRODUCTS_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                 },
                 body: JSON.stringify({
                    ...form, 
                    stock_quantity: parseInt(form.stock_quantity, 10) || 0,
                    image_url: form.image_url || null
                 }),
            });

            if (res.ok) {
                const data = await res.json(); 
                setProducts([...products, data.product]);
                setForm({ product_name:"", price:"", descriptions:"", image_url:"", stock_quantity:""});
            } else {
                const errorData = await res.json();
                console.error("Failed to create new product:", errorData);
            }
        } catch (err) {
            console.error("Failed to create new product:", err);
        }
    };

    const handleEditToggle = (product) => {
        setEditId(product.id);
        setEditForm({
            product_name: product.product_name || "",
            price: product.price || "",
            descriptions: product.descriptions || "",
            image_url: product.image_url || "",
            stock_quantity: product.stock_quantity || 0,
         });
    };

    const handleEditSubmit = async (e,productId) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const res = await fetch (`${ADMIN_PRODUCTS_URL}/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    ...editForm,
                stock_quantity: parseInt(editForm.stock_quantity, 10) || 0
                }),
            });

            if (res.ok) {
                const updateProduct = await res.json();
                setProducts(products.map(p => p.id === productId ? updateProduct : p));
                setEditId(null);
            }
        } catch (err) {
            console.error("Failed to edit product:", err);
        }
    };

    if (!isAdmin) {
        return <p>Access denied. Admins only</p>;
    }

    if (loading) return <p>Loading products...</p>;

    return (
        <div>
            <h2>Edit Products</h2>

            <form onSubmit={handleCreate}>
                <input 
                 type="text"
                 placeholder="Product Name" 
                 value={form.product_name || ""} 
                 onChange={(e) => setForm({ ...form, product_name: e.target.value })} 
                 required 
                />
                <input 
                 type="number"
                 placeholder="Price"  
                 value={form.price} 
                 onChange={(e) => setForm({ ...form, price: e.target.value })} 
                 required 
                />
                <input 
                 type="text" 
                 placeholder="Description" 
                 value={form.descriptions || ""} 
                 onChange={(e) => setForm({ ...form, descriptions: e.target.value })} 
                 required 
                />
                <input 
                 type="text" 
                 placeholder="Image URL (optional)" 
                 value={form.image_url} 
                 onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
                <input 
                 type="number"
                 placeholder="Stock Quantity"
                 value={form.stock_quantity}
                 onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                 required
                />
                <button type="submit">Create Product</button>
            </form>

            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                       {editId === product.id ? (
                        <form onSubmit={(e) => handleEditSubmit(e, product.id)}>
                            <input 
                             type="text"
                             placeholder={product.product_name}
                             value={editForm.product_name}
                             onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
                             required
                            />
                            <input
                             type="number"
                             value={editForm.price}
                             onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                             required
                            />
                            <input
                             type="text"
                             placeholder={product.descriptions}
                             value={editForm.descriptions}
                             onChange={(e) => setEditForm({ ...editForm, descriptions: e.target.value})}
                             required
                            />
                            <input 
                             type="text"
                             placeholder="New Image URL"
                             value={editForm.image_url || ""}
                             onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                            />
                            <input
                             type="number"
                             placeholder="Stock Quantity"
                             value={editForm.stock_quantity}
                             onChange={(e) => setEditForm({ ...editForm, stock_quantity: e.target.value })}
                            />
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setEditId(null)}>Cancel</button>
                        </form>
                       ) : (
                         <>
                            <p><strong>{product.product_name}</strong></p>
                            <p><strong>Price: ${product.price}</strong></p>
                            <p>{product.descriptions}</p>
                            <img 
                             src={product.image_url || stockProductImg} //fallback image url
                             alt={product.product_name || "Product Image"} 
                             width={100} 
                             onError={(e) => e.target.src = stockProductImg} 
                            />
                            <p><strong>Stock: {product.stock_quantity}</strong></p>
                            <br />
                            <button onClick={() => handleEditToggle(product)}>Edit</button>    
                            <button onClick={() => handleDelete(product.id)}>Delete</button>
                         </>  
                       )}
                    </li>
                ))}
            </ul>
        </div>
    );
}