// Page to view product details

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';
import AddToCart from "./AddtoCart";

export default function ProductDetails({product, setProduct}) {
  const PRODUCTS_API_URL = "http://localhost:3000/api/products";

  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await fetch(`${PRODUCTS_API_URL}/${productId}`);
        const data = await response.json();
        console.log(`data details => `, data);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching single product.", error);
      }
    };
    getProduct();
  }, [productId]);

  return (
    <>
    {!product ? (
      <p>Loading product details...</p>
    ) : (
      <div className="singleProductDetailsCard">
        <div>
          <h2>Product Name: {product.product_name}</h2>
          <p><b>Description: </b>{product.descriptions}</p>
          <p><b>Price: </b>${product.price}</p>
          <p><b>Quantity Available: </b>{product.stock_quantity}</p>
          <img
                src={product.image_url || stockImage}
                alt={product.product_name}
          />
          <br />
          <AddToCart product = {product}/>
          <button onClick={() => navigate('/')}>Go Back</button>
        </div>
      </div>
    )}
    </>
  )
};