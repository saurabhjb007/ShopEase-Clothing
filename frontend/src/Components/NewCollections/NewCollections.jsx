import React from "react";
import "./NewCollection.css";
import Item from "../Item/Item";
import { useState } from "react";
import { useEffect } from "react";

const NewCollections = () => {
  const [new_collection, setnew_collection] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/newcollections")
      .then((res) => res.json())
      .then((data) => setnew_collection(data));
  }, []);

  return (
    <div className="newcollections">
      <h1>NEW COLLECTION</h1>
      <hr />
      <div className="collections">
        {new_collection.map((item, i) => {
          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NewCollections;
