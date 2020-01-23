import React, { useEffect, useState, useRef, useMemo } from 'react';
import throttle from 'lodash/throttle';
import Card from './Card';
import './category.css';

function isVisible({ top, height, offset }) {
  return (top  +  offset  +  height  >=  0  &&  top  -  offset  <=  window.innerHeight);
}

function isVisible2({ offsetTop, offsetHeight, offset }) {
  const distanceFromTop = offsetTop + offsetHeight + offset - window.pageYOffset;
  const distanceFromBottom = offsetTop - window.pageYOffset - offset - window.innerHeight;
  return (distanceFromTop  >=  0  &&  distanceFromBottom  <=  0);
}

function Category({ title, description, items, index, virtualized }) {
  const [isContainerVisible, setIsContainerVisible] = useState(index < 2);
  const [isCardVisible, setIsCardVisible] = useState(items.map(() => index < 2));
  const containerRef = useRef(null);
  const cardRef = useRef([]);
  const invisibleItems = useMemo(() => {
    let cardVisibility = [];
    for (let i = 0; i < items.length; ++i) cardVisibility[i] = false;

    return cardVisibility;
  }, [items.length]);
  useEffect(()  =>  { 
    const isInViewport = throttle(() => {
      const offset = 250;
      let containerVisibility = false;
      if (containerRef.current) {
        const { offsetTop, offsetHeight } = containerRef.current;
        containerVisibility = isVisible2({ offsetTop, offsetHeight, offset });
      }
      setIsContainerVisible(containerVisibility);
      
      let cardVisibility = [];
      if (containerVisibility) {
        cardVisibility = items.map((_, itemIndex) => {
          const card = cardRef.current[itemIndex];
          if (card) {
            const { offsetTop, offsetHeight } = card;
            return isVisible2({ offsetTop, offsetHeight, offset });
          }
          return index < 2;
        });
      } else {
        cardVisibility = invisibleItems;
      }
      setIsCardVisible(cardVisibility);
    }, 16);
    
    // we run the function to measure the visibility as soon as the component mount
    isInViewport();
    window.addEventListener('scroll',  isInViewport, true);

    return  ()  =>  {
      window.removeEventListener('scroll',  isInViewport, true);
    };
  },  [index, invisibleItems, items]);

  const containerHeight = useMemo(()  =>  {
    return Math.ceil(items.length  /  2  -  1)  *  30 + Math.ceil(items.length  /  2)  *  160;    
    }, [items.length]);

  return (
    <div className="category">
      <div className="category__title">{title}</div>
      <div className="category__description">{description}</div>
      <ul className="category__container" ref={containerRef} style={{ height: containerHeight }}>
        {(!virtualized || isContainerVisible) &&
          items.map((item, itemIndex) => (
            <li style={{ height: 160 }} key={`menu-item-${item.id}`} ref={ref => { cardRef.current[itemIndex] = ref; }}>
              {(!virtualized || isCardVisible[itemIndex]) && <Card {...item} />}
            </li>)
          )
        }
      </ul>
    </div>
  );
}

export default Category;