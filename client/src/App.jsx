import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProductList from './components/ProductList'
import ProductDetails from './components/ProductDetails'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<ProductList />} />
        <Route path='/products/:productId' element={<ProductDetails />} />
      </Routes>
    </>
  )
}

export default App
