// src/pages/Register.jsx
import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    image: "",
    name: "",
    mobile: "",
    address: "",
    email: "",
    password: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Upload image to Cloudinary
  const handleImageUpload = async () => {
    if (!imageFile) return null;
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", "user_profile"); 

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/varuncloudinarycloud/image/upload`,
        data
      );
      return res.data.secure_url;
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const imageUrl = await handleImageUpload();
      if (!imageUrl) {
        setMessage("Image upload failed");
        setLoading(false);
        return;
      }

      const payload = { ...formData, image: imageUrl };

      await axios.post("http://localhost:3000/api/users/register", payload);
      setMessage("User registered successfully!");
      setFormData({
        image: "",
        name: "",
        mobile: "",
        address: "",
        email: "",
        password: "",
      });
      setImageFile(null);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="mb-3 w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="mb-3 w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          className="mb-3 w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="mb-3 w-full border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="mb-3 w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="mb-3 w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-600">{message}</p>
        )}
      </form>
    </div>
  );
};

export default Register;
