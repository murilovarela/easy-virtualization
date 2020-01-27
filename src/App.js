import React from 'react';
import Category from './components/Category';
import DATA_MOCK from './mocks/storeMock.json';
import './App.css';

function App() {
  return (
    <div className="App">
      {DATA_MOCK.map((category, index) => (
        <Category key={category.id} {...category} index={index} />
      ))}
    </div>
  );
}

export default App;
