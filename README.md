
# Make your virtualized list

There are a few libraries available if you need to virtualize long lists and improve your page performance. The biggest problem I faced with those libraries is that they are too heavy and sometimes our lists are not as simple as the library is expecting it to be! So let's make customized virtualization list ourselves!

## The virtualization principle

Do not render it if it is not in our field of view. The picture below exemplifies how we can deal with it.

![virtualization diagram](/virtualization-diagram.png)

## Let's code!
You can start by downloading the problematic code from [here](https://github.com/murilovarela/easy-virtualization/tree/problematic-code), and follow the solution thinking.

### 1. The problem
In this project, I faced a page with a large number of product cards that was fine for restaurants, which doesn't have many products, but once that same page started to be used by large grocery stores with thousands of products, the page became slow and our challenge is to virtualize that page to make user experience better. 

### 2. The solution
To begin we need a function that will tell us if the components in our list are visible or not. We can achieve that by checking if: 

1) the distance from the bottom of our component to the top of the page is greater than zero; and 
	```top + offset + height >= 0```
2) the distance from the top of our component to the bottom of the page is less than the page height.
	```top - offset <= window.innerHeight```
	
That means our component is inside the visible part of our browser's page.
```js
function isVisible({ top, offset, height }) {
  return top + offset + height >= 0 && top - offset <= window.innerHeight;
}
```

### 3. Listening to the scroll event
Now that we know the math to calculate if the component is visible, it's time to attach a function to listen to the scroll event. 
```js
useEffect(() => {
  const isInViewportListener = isInViewport;
  window.addEventListener('scroll', isInViewportListener, false);
  isInViewport();
  return () => {
    window.removeEventListener('scroll', isInViewportListener, false);
  };
}, [isInViewport]);
```

### 4. Referencing the category container
With the useRef hook, we have access to the container *rect* information that is needed in the isVisible function, so we can set its visibility to a state.
```js
const  [isContainerVisible, setIsContainerVisible] =  useState(index  <  2);
const  containerRef  =  useRef(undefined);

const isInViewport = useCallback(() => {
  const offset = 250;
  let containerVisibility = false;
  if (containerRef.current) {
    const { top, height } = containerRef.current.getBoundingClientRect();
    containerVisibility = isVisible({ top, offset, height });
  }
  setIsContainerVisible(containerVisibility);
}, [items]);
```

### 5. Calculating the category container hight 
To avoid having the page changing height, we must calculate the container height. In this case, we have a grid with two columns and each card with 260px of height and a gap of 30px.
```js
const listHeight = useMemo(() => {
  const gridColumns = 2;
  const itemHeight = 160;
  const gap = 10;
  const lastGap = 10;
  const containerHeight =
    Math.ceil(items.length / gridColumns - 1) * gap + lastGap + Math.ceil(items.length / gridColumns) * itemHeight;
  return { containerHeight, itemHeight };
}, [items.length]);
```

And if we add a hook to listen for resizing, we can make ir work with the responsivity. The code for useResizeObserver is found in [here](https://github.com/murilovarela/easy-virtualization/blob/master/src/hooks/useResizeObserver.js).
```js
const  [wrapperRef, wrapperWidth] =  useResizeObserver();

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
```

### 6. Virtualizing the items
The items ref must be an array, so we can evaluate all of then at each *isInViewport* call easily. 
```js
const allCardsInvisible = useMemo(() => {
  const cardVisibility = [];
  for (let i = 0; i < items.length; i += 1) cardVisibility[i] = false;
  return cardVisibility;
}, [items.length]);
const [isContainerVisible, setIsContainerVisible] = useState(index < 2);
const [isCardVisible, setIsCardVisible] = useState(allCardsInvisible);
const containerRef = useRef(undefined);
const cardRef = useRef(allCardsInvisible);

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
}, [allCardsInvisible, items]);
```

##  The final component
With a few lines of code, we have made ourselves a virtualized list! There is way more room for improvement, but the point is proved! It is not that hard! 
```js
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
```

One final touch of improvement is to delay the image rendering with a timeout, so it doesn't get rendered while scrolling very fast.
```js
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
```

## How better is our page
The page went from 33124 to 1078 dom-nodes, an improvement of 3000% on dom-nodes count! As seen on [google documentation](https://developers.google.com/web/tools/lighthouse/audits/dom-size) a page should not have more than 1500 nodes wich can reflect drastically on performance.

To improve performance we can call the throttle the *isInViewport* with 16ms, what means it gets called once each 16ms, or 60 times per second, matching the screen update rate.
 
Adding fewer listeners would also improve page performance. Now we are adding 100 listeners to the scroll, which may not be a very good approach, once it can slow down the page, but still not as bad as 33k dom-nodes being rendered at the same time.
