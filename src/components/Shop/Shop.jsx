import React, { useEffect, useState } from "react";
import {
  addToDb,
  deleteShoppingCart,
  getShoppingCart,
} from "../../utilities/fakedb";
import Cart from "../Cart/Cart";
import Product from "../Product/Product";
import "./Shop.css";
import { Link, useLoaderData } from "react-router-dom";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [cart, setCart] = useState([]);
  const { totalProducts } = useLoaderData();
  console.log(totalProducts);

  //   const itemsPerPage = 10; //TODO: make it dynamic
  const totalPage = Math.ceil(totalProducts / itemsPerPage);

  // const pageNumbers = [];
  // for (let i = 1; i <= totalPage; i++){
  //     pageNumbers.push(i)
  // }

  const pageNumbers = [...Array(totalPage).keys()];
  //   console.log(pageNumbers);

  /**
   ** Done: 1. Determine the total number of item:
   *  TODO: 2. Decide on the number of items per page:
   *
   **/

  // useEffect(() => {
  //   fetch("http://localhost:5000/products")
  //     .then((res) => res.json())
  //     .then((data) => setProducts(data));
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/products?currentPage=${currentPage}&itemsPerPage=${itemsPerPage}`
        );
        const jsonData = await response.json();
        setProducts(jsonData);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const storedCart = getShoppingCart();
    const selectedProductIds = Object.keys(storedCart);

    fetch(`http://localhost:5000/productByIds`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(selectedProductIds),
    })
      .then((res) => res.json())
      .then((cartProducts) => {
        const savedCart = [];
        // step 1: get id of the addedProduct
        for (const id in storedCart) {
          // step 2: get product from products state by using id
          const addedProduct = cartProducts.find((product) => product._id === id);
          if (addedProduct) {
            // step 3: add quantity
            const quantity = storedCart[id];
            addedProduct.quantity = quantity;
            // step 4: add the added product to the saved cart
            savedCart.push(addedProduct);
          }
          // console.log('added Product', addedProduct)
        }
        // step 5: set the cart
        setCart(savedCart);
      });
  }, []);

  const handleAddToCart = (product) => {
    // cart.push(product); '
    let newCart = [];
    // const newCart = [...cart, product];
    // if product doesn't exist in the cart, then set quantity = 1
    // if exist update quantity by 1
    const exists = cart.find((pd) => pd._id === product._id);
    if (!exists) {
      product.quantity = 1;
      newCart = [...cart, product];
    } else {
      exists.quantity = exists.quantity + 1;
      const remaining = cart.filter((pd) => pd._id !== product._id);
      newCart = [...remaining, exists];
    }

    setCart(newCart);
    addToDb(product._id);
  };

  const handleClearCart = () => {
    setCart([]);
    deleteShoppingCart();
  };

  const options = [5, 10, 15, 20];
  function handleSelectChange(event) {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(0);
  }

  return (
    <>
      <div className="shop-container">
        <div className="products-container">
          {products.map((product) => (
            <Product
              key={product._id}
              product={product}
              handleAddToCart={handleAddToCart}
            ></Product>
          ))}
        </div>
        <div className="cart-container">
          <Cart cart={cart} handleClearCart={handleClearCart}>
            <Link className="proceed-link" to="/orders">
              <button className="btn-proceed">Review Order</button>
            </Link>
          </Cart>
        </div>
      </div>
      {/* pagination */}
      <div className="pagination">
        <p>
          Current Page: {currentPage + 1} and item per page: {itemsPerPage}
        </p>
        {pageNumbers.map((number) => (
          <button
            onClick={() => setCurrentPage(number)}
            key={number}
            className={currentPage === number ? "selected" : ""}
          >
            {number + 1}
          </button>
        ))}
        <select value={itemsPerPage} onChange={handleSelectChange}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default Shop;