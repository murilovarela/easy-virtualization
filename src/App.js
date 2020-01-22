import React, { useEffect, useState } from 'react';
import Category from './components/Category';
import DATA_MOCK from './mocks/storeMock.json';
import './App.css';

function App() {
  const [domCount, setDomCount] = useState(0);
  const [isVirtualized, setIsVirtualized] = useState(true);

  useEffect(()  =>  { 
    const updateDomCount = () => {
      setDomCount(document.getElementsByTagName('*').length);
    };
    
    updateDomCount();
    window.addEventListener('scroll',  updateDomCount);

    return  ()  =>  {
      window.removeEventListener('scroll',  updateDomCount);
    };
  },  [isVirtualized]);

  return (
    <div className="App">
      {DATA_MOCK.map((category, index) => <Category key={category.id} {...category} virtualized={isVirtualized} index={index} />)}
      <div className="dom-count">
        {`${domCount} dom-nodes`}
        <button onClick={() => setIsVirtualized(!isVirtualized)} className="dom-count__btn">
          {isVirtualized ? 'Disable' : 'Enable'}
        </button>
      </div>      
    </div>
  );
}

export default App;
