const Footer = () => {
  return (
    <footer className="relative dark:bg-background/40 bg-white/40 text-white py-6">
      <div className="container mx-auto flex flex-col justify-center gap-2 items-center">
        {/* <div className="space-x-4">
          <a href="#" className="hover:text-gray-400">Home</a>
          <a href="#" className="hover:text-gray-400">About Us</a>
          <a href="#" className="hover:text-gray-400">Contact Us</a>
          <a href="#" className="hover:text-gray-400">Privacy Policy</a>
          <a href="#" className="hover:text-gray-400">Terms of Service</a>
        </div> */}
        <div className="text-sm dark:text-white text-black">
          &copy; {new Date().getFullYear()} All rights reserved. Developed by Rishabh Pathak
        </div>
      </div>
    </footer>
  );
};

export default Footer;