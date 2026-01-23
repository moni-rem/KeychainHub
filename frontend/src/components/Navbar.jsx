import { FaShoppingCart } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

export default function Navbar(){

    return(
        <>
        <div className="flex justify-between items-center bg-blue-200  h-20 text-center  font-sans text-gray-600 p-8  "  >
        <nav className="flex flex-row gap-8 font-semibold">
            <ul><a>Home</a></ul>
            <ul>Shop</ul>
            <ul>Blog</ul>
            <ul>Contact</ul>
        </nav>

        <div className="flex flex-row gap-8">
        <a href="/cart" className="flex items-center gap-4">
          <FaShoppingCart className="text-gray-800" size={20} />
          
        </a>

     
        <a href="/profile" className="flex items-center gap-2">
         <CgProfile className="text-gray-800" size={20}/>
        </a>
        
        </div>
        </div>
        </>
    )
}