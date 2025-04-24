import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

import ProductList from './components/ProductList'
import ProductDetails from './components/ProductDetails'
import Navigations from './components/Navigations'
import LoginForm from './components/LoginForm'
import Register from './components/Register'

function App() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);

  return (
    <>
      <Navigations />
      <Routes>
        <Route path='/' element={<ProductList products={products} setProducts={setProducts} />} />
        <Route path='/products/:productId' element={<ProductDetails product={product} setProduct={setProduct}/>} />
        <Route path= '/login' element={<LoginForm/>}/>
        <Route path='/register' element={<Register/>}/>
      </Routes>
    </>
  )
}
export default App