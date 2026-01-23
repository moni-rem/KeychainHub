import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Slideshow from "./Slideshow";
// import AnimatedCard from './Card'; // keep ready for later

const Home = () => {
  const [cards, setCards] = useState([]);

  // You can fetch or populate cards here
  // useEffect(() => {
  //   setCards(fetchedData);
  // }, []);

  return (
    <div className="mt-20 px-4 md:px-16 flex flex-col items-center">
      {/* Hero Section */}
      <motion.h1
        className="font-bold text-5xl text-center mb-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        GET THE HIGHLIGHT
      </motion.h1>

      <motion.p
        className="text-gray-700 text-lg text-center max-w-xl mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      >
        Discover our exclusive keychains and accessories. Perfect for gifts or
        personal collections.
      </motion.p>

      {/* Slideshow */}
      <Slideshow />

      {/* Horizontal Scrollable Cards (optional, uncomment when ready) */}
      {/* 
      <div className="overflow-x-auto w-full py-8">
        <div className="flex gap-6 px-4">
          {cards.map((card, index) => (
            <AnimatedCard
              key={index}
              title={card.title}
              description={card.description}
              image={card.image}
              delay={index * 0.2}
              className="min-w-[400px] md:min-w-[500px] flex-shrink-0"
            />
          ))}
        </div>
      </div> 
      */}
    </div>
  );
};

export default Home;
