import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import './category.css';

function Category({ title, description, items }) {
  return (
    <div className="category">
      <div className="category__title">{title}</div>
      <div className="category__description">{description}</div>
      <ul className="category__container">
        {items.map(item => (
          <li key={`menu-item-${item.id}`}>
            <Card {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

Category.propTypes = {
  description: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};

export default Category;
