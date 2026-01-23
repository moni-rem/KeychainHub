import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [slideIndex, setSlideIndex] = useState(0);

  const nextSlide = () => setSlideIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const setCurrentSlide = (index) => setSlideIndex(index);

  return (
    <div className="w-full md:w-[1200px] mx-auto relative h-[500px] md:h-[600px]">
      <AnimatePresence>
        {slides.map((slide, index) =>
          index === slideIndex && (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />

              <div className="absolute top-1/2 left-4 -translate-y-1/2 
               text-white p-6 md:p-10 rounded-lg  flex flex-col 
               md:flex-row items-center gap-4 md:gap-6 max-w-md md:max-w-xl">
                
                {/* Text */}
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">{slide.title}</h2>
                  <p className="text-sm md:text-base mt-2">{slide.description}</p>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 -translate-y-1/2 text-white bg-black bg-opacity-30 hover:bg-opacity-70 px-4 py-2 rounded-full text-2xl z-10"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-white bg-black bg-opacity-30 hover:bg-opacity-70 px-4 py-2 rounded-full text-2xl z-10"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, index) => (
          <span
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-4 h-4 rounded-full cursor-pointer transition-colors duration-300 ${
              index === slideIndex ? "bg-gray-800" : "bg-gray-400"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
