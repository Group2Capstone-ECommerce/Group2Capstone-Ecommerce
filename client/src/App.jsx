import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProductList from './components/ProductList'
import ProductDetails from './components/ProductDetails'
import Cart from './components/Cart'

function App() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [token, setToken] = useState('');
  return (
    <>
      <Routes>
        <Route path='/' element={<ProductList products={products} setProducts={setProducts} />} />
        <Route path='/products/:productId' element={<ProductDetails product={product} setProduct={setProduct}/>} />
        <Route path='/cart' element={<Cart token={token} />}/>
      </Routes>
    </>
  )
}

export default App
