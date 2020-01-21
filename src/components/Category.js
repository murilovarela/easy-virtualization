import React from 'react';
import Card from './Card';
import './category.css';

function Category({ title, description, items }) {
  return (
    <div className="category">
      <div className="category__title">{title}</div>
      <div className="category__description">{description}</div>
      <ul className="category__container">
        {
          items.map(item => <li key={`menu-item-${item.id}`}><Card {...item} /></li>)
        }
      </ul>
    </div>
  );
}

export default Category;