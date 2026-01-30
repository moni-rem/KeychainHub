import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "..//../services/fakeAuthService";

export default function UserRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    try {
      registerUser(email, password);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleRegister} className="p-8 max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-10 text-center">
            Create Account
          </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
               className="border p-2 w-full mb-3 rounded-lg shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500"

        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
              className="border p-2 w-full mb-3 rounded-lg shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500"

        required
      />

       <input
        type="password"
        placeholder="Confirm Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 w-full mb-3 rounded-lg shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500"

        required
      />

  <button className="bg-green-600 text-white p-2 text-md rounded-lg w-24 hover:shadow-2xl transition ml-36">
        Register
      </button>
    </form>
  );
}
