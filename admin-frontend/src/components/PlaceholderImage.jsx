import React from "react";
import { Image as ImageIcon } from "lucide-react";

const PlaceholderImage = ({ width = 400, height = 300, text = "No Image" }) => {
  return (
    <div
      className="flex items-center justify-center bg-gray-100 text-gray-400"
      style={{ width, height }}
    >
      <div className="text-center">
        <ImageIcon size={48} className="mx-auto mb-2" />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
};

export default PlaceholderImage;
