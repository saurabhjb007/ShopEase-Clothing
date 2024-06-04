import React from 'react'
import "./DescriptionBox.css"

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className="descriptionbox-nav-box fade">Reviews (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>ShopEase is your ultimate destination for stylish and affordable clothing. We offer a wide range of fashion-forward apparel for men, women, and children, including the latest trends and timeless classics. Our user-friendly website makes it easy to browse and shop for your favorite outfits, with detailed product descriptions, high-quality images, and secure payment options. Enjoy fast shipping and excellent customer service with every purchase at ShopEase. Dress well, feel great, and shop with ease!</p>
        <p>Explore our extensive collection of chic and trendy outfits for every occasion. From casual wear to formal attire, our diverse range ensures that you’ll find something perfect to match your style. Enjoy a seamless shopping experience with our intuitive website, easy navigation, and detailed product information.</p>
      </div>
    </div>
  )
}

export default DescriptionBox
