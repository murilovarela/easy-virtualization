import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import useResizeObserver from '../hooks/useResizeObserver';
import Card from './Card';
import './category.css';

function isVisible({ top, offset, height }) {
  return top + offset + height >= 0 && top - offset <= window.innerHeight;
}
function Category({ title, description, items, index }) {
  const allCardsInvisible = useMemo(() => {
    const cardVisibility = [];
    for (let i = 0; i < items.length; i += 1) cardVisibility[i] = false;
    return cardVisibility;
  }, [items.length]);
  const [isContainerVisible, setIsContainerVisible] = useState(index < 2);
  const [isCardVisible, setIsCardVisible] = useState(allCardsInvisible);
  const containerRef = useRef(undefined);
  const cardRef = useRef(allCardsInvisible);
  const [wrapperRef, wrapperWidth] = useResizeObserver();

  const listHeight = useMemo(() => {
    const isMobile = wrapperWidth < 650;
    const gridColumns = isMobile ? 1 : 2;
    const itemHeight = 160;
    const gap = isMobile ? 0 : 10;
    const lastGap = isMobile ? 0 : 10;
    const containerHeight =
      Math.ceil(items.length / gridColumns - 1) * gap + lastGap + Math.ceil(items.length / gridColumns) * itemHeight;
    return { containerHeight, itemHeight };
  }, [items.length, wrapperWidth]);

  const isInViewport = useCallback(() => {
    const offset = 250;
    let containerVisibility = false;
    if (containerRef.current) {
      const { top, height } = containerRef.current.getBoundingClientRect();
      containerVisibility = isVisible({ top, offset, height });
    }
    setIsContainerVisible(containerVisibility);

    let cardsVisibility = allCardsInvisible;
    if (containerVisibility) {
      cardsVisibility = items.map((_, itemIndex) => {
        const card = cardRef.current[itemIndex];

        if (card) {
          const { top, height } = card.getBoundingClientRect();
          return isVisible({ top, offset, height });
        }

        return false;
      });
    }

    setIsCardVisible(cardsVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCardsInvisible, items, wrapperWidth]);

  useEffect(() => {
    const isInViewportListener = isInViewport;
    window.addEventListener('scroll', isInViewportListener, false);
    isInViewport();
    return () => {
      window.removeEventListener('scroll', isInViewportListener, false);
    };
  }, [isInViewport]);

  return (
    <div className="category" ref={wrapperRef}>
      <div className="category__title">{title}</div>
      <div className="category__description">{description}</div>
      <ul className="category__container" style={{ height: listHeight.containerHeight }} ref={containerRef}>
        {isContainerVisible &&
          items.map((item, cardIndex) => (
            <li
              key={`menu-item-${item.id}`}
              style={{ height: listHeight.itemHeight }}
              ref={ref => {
                cardRef.current[cardIndex] = ref;
              }}
            >
              {isCardVisible[cardIndex] && <Card {...item} />}
            </li>
          ))}
      </ul>
    </div>
  );
}

Category.propTypes = {
  description: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  items: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};

export default Category;
