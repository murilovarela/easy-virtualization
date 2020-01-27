import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './card.css';

function Card({ title, imageUrl, description, price, isSale }) {
  const [loadImage, setLoadImage] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadImage(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="card">
      {loadImage && <img className="card__image" alt="" src={imageUrl} />}
      <div className="card__title">{title}</div>
      <div className="card__description">{description}</div>
      <div className="card__price">{price}</div>
      {isSale && <div className="card__is-sale">50% OFF!</div>}
    </div>
  );
}

Card.propTypes = {
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  isSale: PropTypes.bool.isRequired,
  price: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default Card;
