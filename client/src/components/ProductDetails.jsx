// Page to view product details

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import stockImage from '../assets/stockProductImg.png';
import AddToCart from "./AddtoCart";
import "./CSS/productDetail.css"

export default function ProductDetails({product, setProduct}) {
  const PRODUCTS_API_URL = "https://group2capstone-ecommerce.onrender.com/api/products";

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
      <div className="pageWrapper">
        {!product ? (
          <p>Loading product details...</p>
        ) : (
          <div className="singleProductDetailsCard">
            <div className="productContent">
              <img
                    src={product.image_url || stockImage}
                    alt={product.product_name}
              />
              <div className="productInfo">
                <h2 className="productTitle">Product Name: {product.product_name}</h2>
                <p><b>Description: </b>{product.descriptions}</p>
                <p><b>Price: </b>${product.price}</p>
                <p><b>Quantity Available: </b>{product.stock_quantity}</p>
              </div>
            </div>
            <div className="detailAction">
              <AddToCart product = {product}/>
              <button 
                className="goBackBtn"
                onClick={() => navigate('/')}
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
};