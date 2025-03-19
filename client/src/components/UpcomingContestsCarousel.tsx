import React, { useEffect, useState } from "react";
import ContestCard from "./ContestCard";
import useAuth from "@/hooks/useAuth";
import NotificationSettings from "./NotificationSetting";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/constants";

interface UpcomingContestsProps {
  data: any;
}

interface Contest {
  id: number;
  event: string;
  start: string;
  end: string;
  duration: number;
  host: string;
  href: string;
  resource: string;
  contestType: "live" | "upcoming" | "past";
}

// const containerVariants = {
//   hidden: { opacity: 0, scale: 0.95, y: 20 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     y: 0,
//     transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.15 },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20, scale: 0.95 },
//   visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
// };

const ContestList: React.FC<UpcomingContestsProps> = ({ data }) => {
  const { fetchYtSolutions, setShowSettings, showSettings } = useAuth();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      setIsDataLoaded(true);
    }
  }, [data]);

  useEffect(() => {
    if (isDataLoaded) {
      console.log("Yoy");
      fetchYtSolutions();
    }
  }, [isDataLoaded]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {showSettings && (
        <NotificationSettings
          onSave={() => setShowSettings(false)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {data.map((contest: Contest) => (
        <motion.div key={contest.id} variants={itemVariants}>
          <ContestCard contest={contest} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ContestList;
