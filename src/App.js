import React from 'react';
import Category from './components/Category';
import DATA_MOCK from './mocks/storeMock.json';
import './App.css';

function App() {
  return (
    <div className="App">
      {
        DATA_MOCK.map(category => <Category key={category.id} {...category} />)
      }      
    </div>
  );
}

export default App;
