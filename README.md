
# Make your virtualized list

There are a few libraries available if you need to virtualize long lists and improve your page performance. The biggest problem I faced with those libraries is that they are too heavy and sometimes our lists are not as simple as the library is expecting it to be! So let's make customized virtualization list ourselves!

## The virtualization principle

Do not render it if it is not in our field of view. The picture below exemplifies how we can deal with it.
![image](link)

## Let's code!
You can start by downloading the problematic code from here, and follow the solution thinking.

### 1. The problem
In this project, I faced a page with a large number of product cards that was fine for restaurants, which doesn't have many products, but once that same page started to be used by large grocery stores with thousands of products, the page became slow and our challenge is to virtualize that page to make user experience better. 

### The solution
To begin we need a function that will tell us if the components in our list are visible or not. We can achieve that by checking if: 

1) the distance from the bottom of our component to the top of the page is greater than zero; and 
![image](link)
2) the distance from the top of our component to the bottom of the page is less than the page height.
![image](link)
That means our component is inside the visible part of our browser's page.

<code>

### Listening to the scroll event
Now that we know the math to calculate if the component is visible, it's time to attach a function to listen to the scroll event. 

<code>

### Referencing the category container
With the useRef hook, we have access to the container ~rect~ information that is needed in the isVisible function, so we can set its visibility to a state.

<code>

### Calculating the category container hight 
To avoid having the page changing height, we must calculate the container height. In this case, we have a grid with two columns and each card with 260px of height and a gap of 30px.

<code>

### Virtualizing the items
The items ref must be an array, so we can evaluate all of then at each isInViewport~ call easily. 

<code>

##  The final component
With a few lines of code, we have made ourselves a virtualized list! There is way more room for improvement, but the point is proved! It is not that hard! 

<code>

One final touch of improvement is to delay the image rendering with a timeout, so it doesn't get rendered while scrolling very fast.

<code> 

## How better is our page
The page went from 33124 to 1078 dom-nodes, an improvement of 3000% on dom-nodes count! As seen on [google documentation](https://developers.google.com/web/tools/lighthouse/audits/dom-size) a page should not have more than 1500 nodes wich can reflect drastically on performance.

To improve performance we can call the throttle the ~isInViewport~ with 16ms, what means it gets called once each 16ms, or 60 times per second, matching the screen update rate.

We can listen for screen width change to recalculate our heights and work with responsivity. 
 
Adding fewer listeners would also improve page performance. Now we are adding 100 listeners to the scroll, which may not be a very good approach, once it can slow down the page, but still not as bad as 33k dom-nodes being rendered at the same time.
