import React, { useRef } from "react";
import { motion } from "framer-motion";
import k1 from "..//../assets/k1.jpg";
import k2 from "..//../assets/k2.jpg";
import k3 from "..//../assets/k3.jpg";
import k4 from "..//../assets/k4.jpg";
import k5 from "..//../assets/k5.jpg";

const slides = [
  {
    image: k1,
    title: "Premium Keychain",
    description: "High-quality handmade keychain to keep your keys stylish.",
  },
  {
    image: k3,
    title: "Stylish Key Holder",
    description: "Modern key holder to organize your keys at home.",
  },
  {
    image:k2,
    title: "Leather Key Pouch",
    description: "Compact leather pouch to carry your keys safely.",
  },
    {
    image:k4,
    title: "Leather Key Pouch",
    description: "Compact leather pouch to carry your keys safely.",
  },  {
    image:k5,
    title: "Leather Key Pouch",
    description: "Compact leather pouch to carry your keys safely.",
  },
];

const Slideshow = () => {
  const carouselRef = useRef();

  return (
    <div className="w-full md:w-[1200px] mx-auto overflow-x-auto py-8">
      <motion.div
        ref={carouselRef}
        className="flex gap-6 cursor-grab"
        drag="x"
        dragConstraints={{ left: -1000, right: 0 }} // 
      >
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            className="relative min-w-[300px] md:min-w-[400px] h-[400px] md:h-[500px] rounded-lg shadow-lg overflow-hidden flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            {/* White Text Box */}
            <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-white bg-opacity-10 p-4 md:p-6 rounded-lg shadow-md max-w-xs">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">{slide.title}</h2>
              <p className="text-sm md:text-base text-gray-700 mt-2">{slide.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Slideshow;
