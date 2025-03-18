export const defaulturl = "https://tle-assingment.onrender.com/"
// export const defaulturl = "http://localhost:5000/"

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