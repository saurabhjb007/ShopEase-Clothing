import React, { createContext, useState, useEffect } from "react";

// Create context
export const ShopContext = createContext(null);

// Function to initialize default cart
const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

// ShopContextProvider component
const ShopContextProvider = (props) => {
  // State for cart items and all products
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [all_product, setall_product] = useState([]);

  // useEffect hook to fetch all products and cart items on component mount
  useEffect(() => {
    // Fetch all products
    fetch("http://localhost:3000/allproducts")
      .then((res) => res.json())
      .then((data) => setall_product(data))
      .catch((error) => console.error("Error fetching products:", error));

    // Fetch cart items if authenticated
    const authToken = localStorage.getItem("auth-token");
    if (authToken) {
      fetch("http://localhost:3000/getcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": authToken,
        },
        body: JSON.stringify({}), // Empty body if not required
      })
        .then((res) => res.json())
        .then((data) => setCartItems(data))
        .catch((error) => console.error("Error fetching cart items:", error));
    }
  }, []);

  // Function to add item to cart
  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    const authToken = localStorage.getItem("auth-token");
    if (authToken) {
      fetch("http://localhost:3000/addtocart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": authToken,
        },
        body: JSON.stringify({ itemId }),
      })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error adding to cart:", error));
    }
  };

  // Function to remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    const authToken = localStorage.getItem("auth-token");
    if (authToken) {
      fetch("http://localhost:3000/removefromcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": authToken,
        },
        body: JSON.stringify({ itemId }),
      })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error removing from cart:", error));
    }
  };

  // Function to calculate total cart amount
  const getTotalCartAmount = (cartItems) => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );
        if (itemInfo) {
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // Function to calculate total cart items
  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  // Context value to be provided to consumers
  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
  };

  // Render the provider with context value and children
  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

// Export ShopContextProvider component
export default ShopContextProvider;
