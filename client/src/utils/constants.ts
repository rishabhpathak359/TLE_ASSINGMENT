export const defaulturl = "https://tle-assingment-9u4q.vercel.app/"
// export const defaulturl = "http://localhost:5000/"
export const containerVariants = {                       //for container animations using framer-motion
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.15 },
  },
};

export const itemVariants = {                   // for individual animations 
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
};
export interface Contest {
    contestId: string;
    id: string;
    title: string;
    contestDateTime: string;
    link: string;
    duration: string;
    solution?: string;
    platform: string;
  }
  
  export interface ContestTableProps {
    contests: Contest[];
    isPast: boolean;
    type: string;
  }

  export interface ContestsResponse {
    contests: Contest[];
    totalPages: number;
  }
  