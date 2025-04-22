import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProductList from './components/ProductList'
import ProductDetails from './components/ProductDetails'

function App() {
  const [products, setProducts] = useState([]);

  return (
    <>
      <Routes>
        <Route path='/' element={<ProductList products={products} setProducts={setProducts} />} />
        <Route path='/products/:productId' element={<ProductDetails />} />
      </Routes>
    </>
  )
}

export default App
