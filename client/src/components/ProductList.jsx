// Page to view all products available for purchase
import { useEffect } from "react";
import { Link } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';
import AddToCart from "./AddtoCart";
import "./CSS/productList.css"

export default function ProductList({ products, setProducts }) {
  const PRODUCTS_API_URL = "http://localhost:3000/api/products";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(PRODUCTS_API_URL);
        const data = await response.json();
        console.log("Fetched products:", data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <div className="productsContainer">
        {products.length === 0 ? (
          <p>Loading products...</p>
        ) : (
          products?.map((product) => (
            <div key={product.id} id={product.id} className="productCard">
              <h3>{product.product_name}</h3>
              <img
                src={product.image_url || stockImage}
                alt={product.product_name}
              />
              {product.is_available ? (
                <p id="productAvailableTxt">Available</p>
              ) : (
                <p id="productNotAvailableTxt">Not Available</p>
              )}
              <div className="productActionButtons">
                <AddToCart product = {product}/>
                <Link to={`/products/${product.id}`}>
                  <button className="seeDetailsBtn">See Details</button>
                </Link>
              </div>
              
            </div>
          ))
        )}
      </div>
    </>
  );
}