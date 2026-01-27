// import React from 'react';
// import { motion } from 'framer-motion';

// export default function AnimatedCard({ title, description, image, delay = 0 }) {
//   return (
//     <motion.div
//       className="max-w-sm bg-white rounded-xl shadow-md overflow-hidden m-4"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay }}
//       whileHover={{ scale: 1.05 }}
//     >
//       {/* Image */}
//       {image && (
//         <img className="w-full h-48 object-cover" src={image} alt={title} />
//       )}

//       {/* Content */}
//       <div className="p-6">
//         <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>

//       </div>
//     </motion.div>
//   );
// }
