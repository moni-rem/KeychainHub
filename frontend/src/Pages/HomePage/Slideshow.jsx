import React, { useRef } from "react";
import { motion } from "framer-motion";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    title: "Premium Keychain",
    description: "High-quality handmade keychain to keep your keys stylish.",
  },
  {
    image: "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1000&q=80",
    title: "Stylish Key Holder",
    description: "Modern key holder to organize your keys at home.",
  },
  {
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80",
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
            <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-white bg-opacity-90 p-4 md:p-6 rounded-lg shadow-md max-w-xs">
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
