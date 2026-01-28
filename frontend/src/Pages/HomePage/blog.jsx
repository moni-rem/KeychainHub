import React from "react";
import { motion } from "framer-motion";
import keychain from "../../assets/keychain.jpg";
import { useNavigate } from "react-router-dom";

export default function BlogApp() {
  const posts = [
    {
      id: 1,
      title: "Premium Keychain Collection",
      subtitle: "Elevate your everyday essentials with style and functionality.",
      date: "Jan 20, 2026",
      content: `Discover the perfect blend of style, functionality, and personal expression with our premium keychains, designed to elevate your everyday essentials. Crafted from high-quality materials, each keychain is built to last, ensuring that your keys stay organized and secure while adding a touch of elegance to your daily routine. 

Whether you prefer a sleek minimalist design, a playful charm, or a bold statement piece, our collection has something to suit every taste and personality. These keychains are not just practical—they’re a reflection of your style. With smooth finishes, durable metal clasps, and lightweight designs, they easily attach to your keys, bags, or even as a decorative accessory for your favorite items.

Perfect as a thoughtful gift, our keychains are ideal for birthdays, holidays, or as a token of appreciation for friends, family, or colleagues. Beyond aesthetics, they are engineered for convenience, helping you quickly find your keys and keep them neatly organized, reducing the hassle of lost or tangled items. Transform an ordinary necessity into a statement of style and personality today!`,
    },
  ];

   const navigate = useNavigate();
   
  return (
    <div className="min-h-screen  font-sans mt-20">
      <main className="max-w-6xl mx-auto px-4 py-20">
        {posts.map((post) => (
          <React.Fragment key={post.id}>
            {/* Title */}
            <motion.h1
              className="font-bold text-5xl text-left mb-4"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {post.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-gray-600 mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            >
              {post.subtitle}
            </motion.p>

            {/* Blog / Product Card */}
            <motion.article
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white mb-20 overflow-hidden "
            >
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <motion.div
                  initial={{ scale: 1.3, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-64 md:h-full overflow-hidden"
                >
                  <img
                    src={keychain}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 1.0, ease: "easeOut" }}
                  className="p-8 flex flex-col justify-center"
                >
                  <p className="text-sm text-gray-400 mb-3">{post.date}</p>
                  {post.content.split("\n\n").map((para, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-4 text-lg">
                      {para}
                    </p>
                  ))}

                 
                  <motion.button
                    onClick={() => navigate("/shop")}
                    whileHover={{ scale: 1.05, letterSpacing: "0.05em" }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg w-fit"
                  >
                    Shop Now
                  </motion.button>
                </motion.div>
              </div>
            </motion.article>
          </React.Fragment>
        ))}
      </main>
    </div>
  );
}
