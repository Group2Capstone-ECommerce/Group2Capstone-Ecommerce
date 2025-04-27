import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

import ProductList from './components/ProductList'
import ProductDetails from './components/ProductDetails'
import LoginForm from './components/LoginForm'
import Navigations from './components/Navigations'
import Cart from './components/Cart'
import Register from './components/Register'
import AdminDashboard from './components/AdminDashboard'
import Account from './components/Account'
import Logout from './components/Logout'

function App() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [token, setToken] = useState('');
  return (
    <>
      <Navigations />
      <Routes>
        <Route path='/' element={<ProductList products={products} setProducts={setProducts} />} />
        <Route path='/products/:productId' element={<ProductDetails product={product} setProduct={setProduct}/>} />
        <Route path='/cart' element={<Cart token={token} />}/>
        <Route path= '/login' element={<LoginForm/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/admin' element={<AdminDashboard/>}/>
        <Route path='/account' element={<Account/>}/>
        <Route path='/logout' element={<Logout/>}/>
      </Routes>
    </>
  )
}
export default App