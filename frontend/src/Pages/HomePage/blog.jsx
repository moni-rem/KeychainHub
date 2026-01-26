import React from "react";
import { motion } from "framer-motion";
import keychain from "..//../assets/keychain.jpg";
export default function BlogApp() {
  const posts = [
    {
      id: 1,
      title: "Getting Started with React",
      date: "Jan 20, 2026",
      content:
        "React is a JavaScript library for building user interfaces. It makes creating interactive UIs painless and fun.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans mt-20">
      <main className="max-w-6xl mx-auto px-4 py-20">
        {posts.map((post) => (
          <React.Fragment key={post.id}>
            {/* Title */}
            <motion.h1
              className="font-bold text-5xl text-left mb-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              EXPLORE MORE
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className=" text-3xl text-left mb-8 md:ml-36 ml-4"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            >
              Learn more about products through our Blog
            </motion.p>

            {/* Blog Card */}
            <motion.article
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-xl mb-20 overflow-hidden"
            >
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <motion.div
                  initial={{ scale: 1.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeIn" }}
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
                  transition={{ delay: 0.6, duration: 1.0, ease: "easeOut" }}
                  className="p-8 flex flex-col justify-center"
                >
                  <h2 className="text-3xl font-bold mb-3">{post.title}</h2>
                  <p className="text-sm text-gray-500 mb-5">{post.date}</p>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {post.content}
                  </p>

                  <motion.button
                    whileHover={{ letterSpacing: "0.05em" }}
                    transition={{ duration: 0.4 }}
                    className="mt-8 text-white font-semibold border-b-2 border-white w-fit"
                  >
                    Read more
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
