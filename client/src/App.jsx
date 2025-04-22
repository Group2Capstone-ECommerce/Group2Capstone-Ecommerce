import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProductList from './components/ProductList'
import ProductDetails from './components/ProductDetails'

function App() {
  const [products, setProducts] = useState([]);
  const PRODUCTS_API_URL = "http://localhost:3000/api/products";

  const fetchProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_API_URL);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching all products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <Routes>
        <Route path='/' element={<ProductList products={products} fetchProducts={fetchProducts} />} />
        <Route path='/products/:productId' element={<ProductDetails />} />
      </Routes>
    </>
  )
}

export default App
