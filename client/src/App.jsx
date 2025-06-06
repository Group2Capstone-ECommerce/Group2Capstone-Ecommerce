import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import ProductList from './components/ProductList'
import ProductDetails from './components/ProductDetails'
import LoginForm from './components/LoginForm'
import Navigations from './components/Navigations'
import Cart from './components/Cart'
import Register from './components/Register'
import AdminDashboard from './components/AdminDashboard'
import Account from './components/Account'
import Logout from './components/Logout'
import OrderConfirm from './components/OrderConfirm'
import EditProductsTab from './components/EditProductsTab'
import ViewUsersTab from './components/ViewUsersTab'


function App() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null)
  const [token, setToken] = useState('');
  return (
    <>
      <Navigations />
      {/* {react_toastify library will handle pop-up notification messages} */}
      <ToastContainer 
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        pauseOnHover
      />
      <Routes>
        <Route path='/' element={<ProductList products={products} setProducts={setProducts} />} />
        <Route path='/products/:productId' element={<ProductDetails product={product} setProduct={setProduct}/>} />
        <Route path='/cart' element={<Cart token={token} setCreatedOrder={setCreatedOrder}/>}/>
        <Route path='/order/confirmation' element={<OrderConfirm createdOrder={createdOrder} />}/>
        <Route path= '/login' element={<LoginForm/>}/>
        <Route path='/register' element={<Register/>}/>

        {/* NEST admin-related routes inside /admin */}        
        <Route path='/admin/*' element={<AdminDashboard/>}/>

        <Route path='/admin/products' element={<EditProductsTab />} />
        <Route path='/admin/users' element={<ViewUsersTab />}/> 

        <Route path='/account' element={<Account/>}/>
        <Route path='/logout' element={<Logout/>}/>
      </Routes>
    </>
  )
}
export default App