# Make your own list virtualization

There are a few libraries avaliable if you need to virtualize long lists and improve your page performance. The biggest problem I faced with those libraries is that they are too heavy and sometimes our lists are not as simple as the library is expecting it to be! So let's make our own customized virtualization!

## The virtualization principle

Do not render if is not in our field of view. The picture bellow show we can deal with it.

![Virtualization diagram](/virtualization-diagram.png)

## Let's code!

### The problem
Our challange is to virtualize a page from a large groucery store that lists all its items inside categories in a single page.  

### Starting the solution
To begin we need a function that will tell us if the components in our list are visible or not. We can achieve that by checking if: 

1) the distance from the bottom of our component to the top of the page is grater than zero; and 
2) the distance from the top of our component to the bottom of the page is less than the page height.

What means that our component is inside the visible part of our browser's page.

    function isVisible({ top, height, offset }) {
	    return (top  +  offset  +  height  >=  0  &&  top  -  offset  <=  window.innerHeight);
    }

### Listening to the scroll event
Now that we know the math to calculate if component is visible, it's time to attach a function to listen to the scroll event. 

    useEffect(()  =>  { 
	    const isInViewport = () => {};
	    
	    // we run the function to measure the visibility as soon as the component mount
	    isInViewport();
		window.addEventListener('scroll',  isInViewport);

		return  ()  =>  {
			window.removeEventListener('scroll',  isInViewport);
		};
	},  []);

### Referencing the category container
With the useRef hook we have access to the container rect information that is needed in the isVisible function, so we can set its visibility to a state.

    const isInViewport = () => {
	    const offset = 500;
	    if (containerRef.current) {
			const { top, height } =  containerRef.current.getBoundingClientRect();
			setIsContainerVisible(isVisible({ top, height, offset }));
		} else {
			setIsContainerVisible(false);
		}
	};

### Calculating the category container hight 
To avoid having the page changing height, we must calculate the container height. In this case, we have a grid with two columns.

    const containerHeight = useMemo(()  =>  {
		return Math.ceil(items.length  /  2  -  1)  *  30 + Math.ceil(items.length  /  2)  *  260;    
    }, [items.length]);

### Virtualizing the items
The items ref must be a array, so we can evaluate all of then at each isInViewport call. 

	    const isInViewport = () => {
    	    const offset = 500;
    	    
    	    ...
    	    
			const cardVisibility = items.map((_, itemIndex) => {
				const card = cardRef.current[itemIndex];
				if (card) {
					const { top, height } = card.getBoundingClientRect();
					return isVisible({ top, height, offset });
				}
				return index < 2; // renders the two first categories if evaluation is not possible what is good for server side rendering
	        });
			setIsCardVisible(cardVisiblity);
    	};

##  The final component
With a few lines of code we have made ourselves a virtualized list! There are way more room to improvement, but the point is proved! It is not that hard!

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

## How better is our page
The page went from 33124 to 1078 dom-nodes, an improvement of 3000% on dom-nodes count! As seen on [google documentation](https://developers.google.com/web/tools/lighthouse/audits/dom-size) a page should not have more than 1500 nodes wich can reflect drasticaly on performance.

To improve performance we can call the throttle the isInViewport with 16ms, what means it gets called once each 16ms, or 60 times per secont, matching the screen update rate.

We can listen for screen width change to recalculate our heights and work with responsivity. 