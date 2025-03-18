import React, { useState } from "react";
// import Modal from "react-modal";
import {  X } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion, AnimatePresence } from "framer-motion";
import ContestCard from "./ContestCard";

interface ContestProps {
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

interface Contests {
  contests: ContestProps[] | undefined;
}

const Calendar: React.FC<Contests> = ({ contests }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ContestProps | null>(null);

  const events = (contests ?? []).map((c) => ({
    title: c.event,
    start: c.start,
    extendedProps: c,
  }));

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps);
    setModalIsOpen(true);
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 text-black dark:text-white rounded-xl shadow-xl transition-all">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        events={events}
        eventClick={handleEventClick}
        initialView={"dayGridMonth"}
        headerToolbar={{ start: "title", end: "prev,next" }}
        height={"80vh"}
        dayMaxEventRows={3}
        buttonText={{ today: "Today", month: "Month", prev: "‹", next: "›" }}
        dayCellClassNames={() => "p-4 transition-all rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"}
        viewClassNames={() => "bg-white dark:bg-neutral-900 text-black dark:text-white"}
        eventContent={(arg) => (
          <div className="bg-gray-200 dark:bg-muted-foreground text-black text-xs px-4 py-1 rounded-lg shadow-md overflow-hidden truncate cursor-pointer">
            <span>{arg.event.title}</span>
          </div>
        )}
      />
      
      {/* Animated Modal */}
      <AnimatePresence>
        {modalIsOpen && (
          <motion.div
            // initial={{ opacity: 0, scale: 0.8 }}
            // animate={{ opacity: 1, scale: 1 }}
            // exit={{ opacity: 0, scale: 0.8 }}
            // transition={{ duration: 0.2 }}
            className="fixed inset-0 flex justify-center items-center z-50 bg-black/40"
          >
            <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.8 }}
             transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-10 w-[80%] md:w-[600px] mx-auto outline-none">
              {/* Close Button */}
              <button
                onClick={() => setModalIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white transition"
              >
                <X size={20} />
              </button>

              {selectedEvent && <ContestCard contest={selectedEvent} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
