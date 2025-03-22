import axios from "axios"
const playlists = {
  leetcode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
  codechef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
  codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
};

const extractTimestamps = (description) => {
  const timestampRegex = /(\d{2}:\d{2})\s*(.+)/g;
  let timestamps = [];
  let match;

  while ((match = timestampRegex.exec(description)) !== null) {
    timestamps.push({ time: match[1], title: match[2] });
  }

  return timestamps;
};

const fetchSolutionVideos = async (playlistId) => {
  let allVideos = [];
  let nextPageToken = "";

  try {
    do {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/playlistItems`,
        {
          params: {
            part: "snippet",
            maxResults: 50,
            playlistId,
            pageToken: nextPageToken,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      const videos = response.data.items
        .filter((video) => video.snippet?.resourceId?.videoId) // ✅ Ensure `videoId` exists
        .map((video) => ({
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails?.default?.url || "", // ✅ Handle missing thumbnails
          url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
          uploadedAt: video.snippet.publishedAt, 
          timestamps: extractTimestamps(video.snippet.description)
        }));

      allVideos = [...allVideos, ...videos];
      nextPageToken = response.data.nextPageToken || "";
    } while (nextPageToken);

    return allVideos;
  } catch (error) {
    console.error(`❌ Error fetching videos for playlist ${playlistId}:`, error);
    return [];
  }
};


export const solutions =  async (req, res) => {
  try {
    let { host="all", query, page = 1, limit = 10 } = req.query;

    // if (!platforms) {
    //   return res.status(400).json({ error: "Platforms query parameter is required" });
    // }
    let platformList;
    if (host === "all") {
      platformList = Object.keys(playlists);
    }
    else platformList = host.split(",").map((p) => p.trim().toLowerCase());
    console.log(platformList)
    const invalidPlatforms = platformList.filter((p) => !playlists[p]);

    if (invalidPlatforms.length > 0) {
      return res.status(400).json({ error: `Invalid platforms: ${invalidPlatforms.join(", ")}` });
    }

    let allVideos = [];

    for (const platform of platformList) {
      const videos = await fetchSolutionVideos(playlists[platform]);
      allVideos = [...allVideos, ...videos];
    }

    console.log(allVideos)

    if (query && query!=="") {
      allVideos = allVideos.filter((video) => video.title.split(" | ")[0].toLowerCase().includes(query.toLowerCase()));
    }

    const totalVideos = allVideos.length;
    const startIndex = (page - 1) * limit;
    const paginatedVideos = allVideos.slice(startIndex, startIndex + Number(limit));

    res.json({
      totalVideos,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalVideos / limit),
      videos: paginatedVideos,
    });
  } catch (error) {
    console.error("❌ Error fetching solutions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const contests = async (req, res) => {
  const PLATFORM_IDS = {
    leetcode: 102,
    codeforces: 1,
    codechef: 2,
  };

  try {
    let { host = "all",query="", page = 1, limit = 10, type = "upcoming" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let resourceIds = [];

    if (host === "all") {
      resourceIds = Object.values(PLATFORM_IDS);
    } else {
      const requestedHosts = host.split(",");
      for (let h of requestedHosts) {
        if (PLATFORM_IDS[h]) {
          resourceIds.push(PLATFORM_IDS[h]);
        } else {
          return res.status(400).json({ error: `Invalid platform: ${h}` });
        }
      }
    }

    const getISTTime = (utcDateString) => {
      const utcDate = new Date(utcDateString);
      return new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000)); 
    };
    const currentTime = new Date()
    const responses = await Promise.allSettled(
      resourceIds.map((id) =>
        axios.get(`https://clist.by/api/v4/contest/`, {
          params: {
            resource_id: id,
            with_problems:true,
            order_by: "-start",
            limit: 100,
          },
          headers: {
            Authorization: process.env.CLIST_API_KEY,
          },
        })
      )
    );

    // Separate successful and failed responses 
    let contests = [];
    let failedRequests = 0;
    console.log("Current IST Time:", currentTime);
    
    responses.forEach((result) => {
      if (result.status === "fulfilled") {
        contests.push(...result.value.data.objects);
      } else {
        failedRequests++;
        console.error(`Failed to fetch contests for a platform:`, result.reason);
      }
    });

    // If all API calls failed, return a server error
    if (failedRequests === resourceIds.length) {
      return res.status(500).json({ error: "Failed to fetch contests from all platforms" });
    }

    // Filter Contests Based on Type
    let filteredContests = [];
    if (type === "live" || type === "all") {
      filteredContests.push(
        ...contests
          .filter(
            (contest) =>
              getISTTime(contest.start) <= currentTime && getISTTime(contest.end) > currentTime
          )
          .map((contest) => ({ ...contest, contestType: "live" }))
      );
    }
    if (type === "upcoming" || type === "all") {
      filteredContests.push( 
        ...contests
          .filter((contest) => getISTTime(contest.start) > currentTime)
          .sort((a, b) => getISTTime(a.start) - getISTTime(b.start))
          .map((contest) => ({ ...contest, contestType: "upcoming" }))
      );
    }
    if (type === "past" || type === "all") {
      filteredContests.push(
        ...contests
          .filter((contest) => getISTTime(contest.end) < currentTime)
          .sort((a, b) => getISTTime(b.start) - getISTTime(a.start))
          .map((contest) => ({ ...contest, contestType: "past" }))
      );
    }

    
    if (query && query!=="") {
      filteredContests = filteredContests.filter((contest) => contest.event.toLowerCase().includes(query.toLowerCase()));
    }
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContests = filteredContests.slice(startIndex, endIndex);
  
    res.json({
      total: filteredContests.length,
      page,
      totalPages: Math.ceil(filteredContests.length / limit),
      contests: paginatedContests,
    });
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ error: "Failed to fetch contests" });
  }
};
