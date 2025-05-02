import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import ProductList from './components/ProductList'
import ProductDetails from './components/ProductDetails'
import Navigations from './components/Navigations'
import LoginForm from './components/LoginForm'
import Register from './components/Register'
import AdminDashboard from './components/AdminDashboard'
import Account from './components/Account'
import Logout from './components/Logout'
import ViewUsersTab from './components/ViewUsersTab'

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
        
        {/* NEST admin-related routes inside /admin */}        
        <Route path='/admin/*' element={<AdminDashboard/>}/>

        <Route path='/admin/users' element={<ViewUsersTab />}/> 
        <Route path='/account' element={<Account/>}/>
        <Route path='/logout' element={<Logout/>}/>
      </Routes>
    </>
  )
}
export default App