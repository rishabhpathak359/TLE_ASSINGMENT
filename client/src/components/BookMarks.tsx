// import React from 'react'

import useAuth from "@/hooks/useAuth";
import ContestTable from "./ContestTable";

const BookMarks = () => {
  const { bookmarkedContests } = useAuth();
  console.log(bookmarkedContests);
  return (
    <div className=" relative mt-32 flex justify-center items-center ">
      <div className="hidden fixed inset-0 md:hidden md:dark:flex items-center justify-center pointer-events-none">
        <div className="absolute w-80 h-80 dark:block hidden bg-gray-500 opacity-20 blur-3xl rounded-full top-1/4 left-1/4"></div>
        <div className="absolute w-64 h-64 dark:block hidden bg-gray-500 opacity-20 blur-3xl rounded-full bottom-1/4 right-1/4"></div>

        {/* <div className="w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,255,170,0.3)_0%,rgba(0,0,0,0.8)_70%)] blur-[120px] rotate-[120deg]"></div> */}
      </div>
      <div>
       {bookmarkedContests.length > 0 ?  <div className="relative mt-10 pb-10  md:max-w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
            Past Contests
          </h2>
          <div className=" overflow-x-auto">
            <ContestTable
              contests={bookmarkedContests}
              isPast={true}
              type="upcoming"
            />
          </div>
        </div> 

        :
        <div className=" flex justify-center items-center">
          <div className="">You haven't bookmarked any contest yet</div>
        </div>
        
      }
      </div>
    </div>
  );
};

export default BookMarks;
