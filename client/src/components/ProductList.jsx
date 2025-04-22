// Page to view all products available for purchase

import { Link } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';

export default function ProductList({ products, fetchProducts }) {
  return (
    <div className="productsContainer">
      {products.length === 0 ? (
        <p>Loading products...</p>
      ) : (
        products.map((product) => (
          <div key={product.id} id={product.id} className="productCard">
            <h3>Product Name: {product.product_name}</h3>
            <img
              src={product.image_url || stockImage}
              alt={product.product_name}
            />
            {product.is_available ? (
              <p id="productAvailableTxt">Available</p>
            ) : (
              <p id="productNotAvailableTxt">Not Available</p>
            )}
            <Link to={`/products/${product.id}`}>
              <button className="seeDetailsBtn">See Details</button>
            </Link>
          </div>
        ))
      )}
    </div>
  );
}