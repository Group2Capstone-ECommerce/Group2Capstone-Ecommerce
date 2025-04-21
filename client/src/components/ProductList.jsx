// Page to view all products available for purchase

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const PRODUCTS_API_URL = "http://localhost:3000/api/products";

  useEffect(() => {
    const getProducts = async() => {
      try {
        const response = await fetch(PRODUCTS_API_URL);
        const data = await response.json();
        console.log(`data => `, data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching all products.");
      }
    };
    getProducts();
  }, [])
  
  return (
    <>
      <div className="productsContainer">
      {products.length === 0 ? (
        <p>Loading products...</p>
      ) : (
        products.map((product) => (
          <div key={product.id} id={product.id} className="productCard">
              <h3>Product Name: {product.product_name}</h3>
              <p>Product Description: {product.descriptions}</p>
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  width="150"
                  height="150"
                />
              )}
              {product.is_available ? <p id="productAvailableTxt">Available</p> : <p id="productNotAvailableTxt">Not Available</p>}
              <Link to={`/products/${product.id}`}>
              <button className="seeDetailsBtn">See Details</button>
              </Link>
          </div>
        ))
      )}
      </div>
    </>
  )
};