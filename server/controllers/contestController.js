// import prisma from "../utils/dbConnect.js";

import axios from "axios";

// export const contests = async (req, res) => {
//   try {
//     let { platforms = "all", page = 1, limit = 10, type = "all" } = req.query;

//     console.log(`📌 Fetching contests: platforms=${platforms}, type=${type}, page=${page}, limit=${limit}`);

//     page = parseInt(page, 10);
//     limit = parseInt(limit, 10);

//     let whereClause = {};

//     if (platforms !== "all") {
//       const selectedPlatforms = platforms.split(",").map((p) => p.trim().toUpperCase());
//       if (selectedPlatforms.length > 0) {
//         whereClause.platform = { in: selectedPlatforms };
//       }
//     }

//     const contestType = type.trim().toLowerCase();
    
//     if (contestType === "upcoming") {
//       whereClause.contestDateTime = { gte: new Date() };
//     } else if (contestType === "past") {
//       whereClause.contestDateTime = { lt: new Date() }; 
//     }

//     // console.log("🕒 Current Date:", currentDateTime);
//     // console.log("🔍 Filter Conditions:", JSON.stringify(whereClause, null, 2));
//     let orderBy = type ==="upcoming" ? "asc" : "desc"
//     const totalContests = await prisma.contests.count({ where: whereClause });

//     const contests = await prisma.contests.findMany({
//       where: whereClause,
//       orderBy: { contestDateTime: orderBy }, 
//       skip: (page - 1) * limit,
//       take: limit,
//     });

//     res.json({
//       success: true,
//       totalContests,
//       currentPage: page,
//       totalPages: Math.ceil(totalContests / limit),
//       contests,
//     });

//   } catch (error) {
//     console.error("❌ Error fetching contests:", error.message);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// export const searchContests = async (req, res) => {
//   try {
//     let { query = "", page = 1, limit = 10 } = req.query;

//     console.log(`🔎 Searching contests: query="${query}", page=${page}, limit=${limit}`);

//     page = parseInt(page, 10);
//     limit = parseInt(limit, 10);

//     if (!query.trim()) {
//       return res.status(400).json({ success: false, message: "Search query is required" });
//     }

//     const whereClause = {
//       title: {
//         contains: query.trim(),  
//         mode: "insensitive",     
//       },
//     };

//     const totalContests = await prisma.contests.count({ where: whereClause });

//     const contests = await prisma.contests.findMany({
//       where: whereClause,
//       orderBy: { contestDateTime: "desc" },
//       skip: (page - 1) * limit,
//       take: limit,
//     });

//     res.json({
//       success: true,
//       totalContests,
//       currentPage: page,
//       totalPages: Math.ceil(totalContests / limit),
//       contests,
//     });

//   } catch (error) {
//     console.error("❌ Error searching contests:", error.message);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// export const updateSolution = async (req, res) => {
//   const { contestId } = req.params;
//   const { solution } = req.body;

//   if (!solution) {
//       return res.status(400).json({ message: "Solution link is required" });
//   }

//   try {
//       const updatedContest = await prisma.contests.update({
//           where: { id: contestId },
//           data: { solution },
//       });

//       res.status(200).json({ message: "Solution updated successfully", contest: updatedContest });
//   } catch (error) {
//       console.error("Error updating solution:", error);
//       res.status(500).json({ message: "Internal server error" });
//   }
// };


const playlists = {
  leetcode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
  codechef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
  codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
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
          uploadedAt: video.snippet.publishedAt 
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
    let { host = "all", page = 1, limit = 10, type = "upcoming" } = req.query;
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

    const currentTime = new Date();

    // Fetch data in parallel
    const responses = await Promise.allSettled(
      resourceIds.map((id) =>
        axios.get(`https://clist.by/api/v4/contest/`, {
          params: {
            resource_id: id,
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
              new Date(contest.start) <= currentTime && new Date(contest.end) > currentTime
          )
          .map((contest) => ({ ...contest, contestType: "live" }))
      );
    }
    if (type === "upcoming" || type === "all") {
      filteredContests.push(
        ...contests
          .filter((contest) => new Date(contest.start) > currentTime)
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .map((contest) => ({ ...contest, contestType: "upcoming" }))
      );
    }
    if (type === "past" || type === "all") {
      filteredContests.push(
        ...contests
          .filter((contest) => new Date(contest.end) < currentTime)
          .sort((a, b) => new Date(b.start) - new Date(a.start))
          .map((contest) => ({ ...contest, contestType: "past" }))
      );
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



// const playlists = {
//   leetcode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
//   codechef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
//   codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
// };


// const fetchSolutionVideos = async (playlistId) => {
//   let allVideos = [];
//   let nextPageToken = "";

//   try {
//     do {
//       const response = await axios.get(
//         `https://www.googleapis.com/youtube/v3/playlistItems`,
//         {
//           params: {
//             part: "snippet",
//             maxResults: 50,
//             playlistId,
//             pageToken: nextPageToken, 
//             key: process.env.YOUTUBE_API_KEY,
//           },
//         }
//       );

//       const videos = response.data.items.map((video) => ({
//         title: video.snippet.title.toLowerCase(),
//         link: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
//       }));

//       allVideos = [...allVideos, ...videos];
//       nextPageToken = response.data.nextPageToken || "";
//     } while (nextPageToken); 

//     console.log(`📌 Fetched ${allVideos.length} videos from playlist ${playlistId}`);
//     // console.log(allVideos);
//     return allVideos;
//   } catch (error) {
//     console.error(`❌ Error fetching videos for playlist ${playlistId}:`, error);
//     return [];
//   }
// };
