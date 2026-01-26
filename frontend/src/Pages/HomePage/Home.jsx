//import React, { useState} from "react";
import { motion } from "framer-motion";
import Slideshow from "./Slideshow";
import BlogApp from "./blog";
// import products from "../data/products";
// import ProductCard from "../components/ProductCard";
// import AnimatedCard from './Card'; // keep ready for later
import Footer from "../../components/footer";

const Home = () => {
  //const [cards, setCards] = useState([]);

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

        {/* <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">Our Products</h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div> */}

    <Footer/>
    </div>
  );
};

export default Home;
