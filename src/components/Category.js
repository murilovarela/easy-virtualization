import React, { useEffect, useState, useRef, useMemo } from 'react';
import Card from './Card';
import './category.css';

function isVisible({ top, height, offset, index }) {
  return (top  +  offset  +  height  >=  0  &&  top  -  offset  <=  window.innerHeight);
}

function Category({ title, description, items, index, virtualized }) {
  const [isContainerVisible, setIsContainerVisible] = useState(index < 2);
  const [isCardVisible, setIsCardVisible] = useState(items.map(() => index < 2));
  const containerRef = useRef(null);
  const cardRef = useRef([]);

  useEffect(()  =>  { 
    const isInViewport = () => {
      const offset = 250;
      if (containerRef.current) {
        const { top, height } =  containerRef.current.getBoundingClientRect();
        setIsContainerVisible(isVisible({ top, height, offset }));
      } else {
        setIsContainerVisible(false);
      }
  
      const cardVisibility = items.map((_, itemIndex) => {
        const card = cardRef.current[itemIndex];
        if (card) {
          const { top, height } = card.getBoundingClientRect();
          return isVisible({ top, height, offset });
        }
        return index < 2;
      });
      setIsCardVisible(cardVisibility);
    };
    
    // we run the function to measure the visibility as soon as the component mount
    isInViewport();
    window.addEventListener('scroll',  isInViewport);

    return  ()  =>  {
      window.removeEventListener('scroll',  isInViewport);
    };
  },  [index, items]);

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
              {(!virtualized || isCardVisible) && <Card {...item} />}
            </li>)
          )
        }
      </ul>
    </div>
  );
}

export default Category;