import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBox() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const submitHandler = (e) => {
    e.preventDefault();
    navigate(`/search/name/${name}`);
  };
 
  return (
    <>
        <i onClick={submitHandler} style={{fontSize: 20,color:'gray'}} className="fa fa-search"></i>
        <input type="text" id='q' name="q" className="search-input" placeholder="Search Projects" onChange={(e) => setName(e.target.value)}/>
    </>
  );
}
