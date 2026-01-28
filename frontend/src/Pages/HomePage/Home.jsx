//import React, { useState} from "react";
import { motion } from "framer-motion";
import Slideshow from "./Slideshow";
import BlogApp from "./blog";
import Footer from "../../components/footer";
import ProductList from "./ProductList";


const Home = () => {
  return (
    <div className="mt-20 px-4 md:px-16 flex flex-col items-center">
      {/* Hero Section */}
      <motion.h1
        className="font-bold text-5xl text-center mb-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeIn" }}
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
      <Slideshow />
      <BlogApp/>
      <ProductList/>
      <Footer/>
    </div>
  );
};

export default Home;
