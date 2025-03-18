
import { ThumbsUp, ThumbsDown, YoutubeIcon, LucideYoutube } from "lucide-react";

interface Solution {
  solution :{title: string;
  description: string;
  url: string;
  thumbnail: string;
  uploadedAt?: string;
}
}
const VideoCard = ({ solution }: Solution) => {
    const { title, description, url, thumbnail, uploadedAt } = solution;
    
    // Format upload date
    const formattedDate = uploadedAt
      ? new Date(uploadedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "Unknown";
  
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow h-full overflow-hidden flex flex-col">
        <div className="flex flex-col space-y-1.5 p-6 pb-2">
          <div className="flex justify-between items-start">
            <div className="font-semibold tracking-tight text-lg line-clamp-2">
              {title}
            </div>
          </div>
        </div>
        <div className="p-6 pt-0 flex-grow space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative rounded-md overflow-hidden group"
          >
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <LucideYoutube className="w-12 h-12 text-white" />
            </div>
          </a>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs">{formattedDate}</span> 
          </div>
        </div>
      </div>
    );
  };
export default VideoCard;  