import Footer from "@/components/Footer";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const platforms = ["CodeChef", "LeetCode", "CodeForces"];
const HeroSection = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % platforms.length);
      }, 2000); // Change platform every 2 seconds
      return () => clearInterval(interval);
    }, []);
  return (
    <>
    <div className="relative w-full h-screen flex flex-col justify-center items-center text-center transition-colors duration-300 bg-white text-black dark:bg-background dark:text-white overflow-hidden">
      {/* Background Blob Animation */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360, scale: [0.7, 1.2, 0.7] }}
        transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
      >
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="relative md:w-96 md:h-96 w-32 h-32">
            <div className="absolute w-full h-full rounded-full blur-[120px]  transition-colors duration-300 bg-gradient-to-r from-purple-400 to-green-400 dark:from-orange-400 dark:to-blue-500" />
          </div>
        </div>
      </motion.div>

      {/* Left Curly Brace */}
      <div className=" md:block hidden absolute left-5 md:left-44  top-1/2 transform -translate-y-1/2 text-[120px] md:text-[300px] font-bold text-gray-400 dark:text-gray-600 opacity-50">
        {"{"}
      </div>

      {/* Right Curly Brace */}
      <div className="md:block hidden absolute right-5 md:right-44 top-1/2 transform -translate-y-1/2 text-[120px] md:text-[300px] font-bold text-gray-400 dark:text-gray-600 opacity-50">
        {"}"}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 mt-28"
      >
        <p className="text-sm uppercase tracking-wide px-3 py-1 rounded-full inline-block mb-4 transition-colors duration-300 bg-gray-200 text-black dark:bg-gray-800 dark:text-white">
          Stay Ahead with Coding Contests
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          <span>Upcoming & Past </span>
          <span className="italic dark:text-gray-400 text-gray-600">Programming</span>
          <span> Contests</span>
        </h1>
        <div className="flex flex-col">
        <p className="mt-4 text-lg max-w-2xl mx-auto transition-colors duration-300 text-gray-700 dark:text-gray-300">
          Explore upcoming and past contests from platforms like </p>
          <AnimatePresence mode="wait">
              <motion.span
                key={platforms[index]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-4xl my-2 text-bold italic dark:text-gray-400 text-gray-600 leading-tight"
              >
                {platforms[index]}
              </motion.span>
            </AnimatePresence>
        <p className="mt-4 text-lg max-w-2xl mx-auto transition-colors duration-300 text-gray-700 dark:text-gray-300">
          Never miss an opportunity to test your skills and grow as a programmer.
        </p>
        </div>
        <Link to="/contests">
        <button className="mt-6 px-6 py-3 font-semibold rounded-lg shadow-md transition-colors duration-300 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 hover:cursor-pointer">
          View Contests
        </button>
        </Link>
      </motion.div>
    </div>
      <Footer/>
      </>
  );
};

export default HeroSection;
