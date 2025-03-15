// import { codechefScraper, codeforcesScraper, leetCodeScraper } from "../scraper.js";
import axios from "axios";
import { codechefScraper } from "../scrapper/codechefScraper.js";
import { leetCodeScraper } from "../scrapper/leetCodeScraper.js";
import prisma from "./dbConnect.js";
import cron from "node-cron";

const playlists = {
  LC: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
  CC: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
  CF: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
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

      const videos = response.data.items.map((video) => ({
        title: video.snippet.title.toLowerCase(),
        link: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
      }));

      allVideos = [...allVideos, ...videos];
      nextPageToken = response.data.nextPageToken || "";
    } while (nextPageToken); 

    console.log(`📌 Fetched ${allVideos.length} videos from playlist ${playlistId}`);
    // console.log(allVideos);
    return allVideos;
  } catch (error) {
    console.error(`❌ Error fetching videos for playlist ${playlistId}:`, error);
    return [];
  }
};


const addContestsToDB = async () => {
  try {
    console.log("🔄 Scraping contests from all platforms...");
    // Fetch contests from all platforms
    const { upcomingContests: ccUpcoming, pastContests: ccPast } = await codechefScraper();
    const { upcomingContests: lcUpcoming, pastContests: lcPast } = await leetCodeScraper();
    // const { upcomingContests: cfUpcoming, pastContests: cfPast } = await codeforcesScraper();
    const codechefAllContests = [...ccUpcoming, ...ccPast];
    const leetcodeAllContests = [...lcUpcoming, ...lcPast];
    // const codeforcesAllContests = [cfUpcoming, cfPast];

    const lcSolutionVideos = await fetchSolutionVideos(playlists.LC);
    const ccSolutionVideos = await fetchSolutionVideos(playlists.CC);
    // const cfSolutionVideos = await fetchSolutionVideos(playlists.CF); 

    leetcodeAllContests.forEach((contest) => {
      const matchedVideo = lcSolutionVideos.find((video) =>
        video.title.includes(contest.name.toLowerCase())
      );
      if (matchedVideo) {
        contest.solution = matchedVideo.link;
      }
      contest.platform = "LC";
    });
     codechefAllContests.forEach((contest) => {
      const id = contest.name.substring(5);
      console.log(id);
      const matchedVideo = ccSolutionVideos.find((video) =>
        video.title.includes(id)
      );
      if (matchedVideo) {
        contest.solution = matchedVideo.link;
      }
      contest.platform = "CC";
    });
    // codeforcesAllContests.forEach((contest) => {
    //   const matchedVideo = cfSolutionVideos.find((video) =>
    //     video.title.includes(contest.name.toLowerCase())
    //   );
    //   if (matchedVideo) {
    //     contest.solution = matchedVideo.link;
    //   }
    //   contest.platform = "CF";
    // });
     const allContests = [...codechefAllContests, ...leetcodeAllContests];
    console.log(`📌 Total Contests Found: ${allContests.length}`);
    for (const contest of allContests) {
      const existingContest = await prisma.contests.findFirst({
        where: { title: contest.name, contestDateTime: contest.contestDateTime }
      });

      if (!existingContest) {
        await prisma.contests.create({
          data: {
            title: contest.name,
            contestDateTime: contest.contestDateTime,
            duration: contest.duration,
            solution: contest.solution || "",
            link: contest.link,
            platform: contest.platform
          }
        });
        console.log(`✅ Added: ${contest.name} [${contest.platform}]`);
      } else {
        console.log(`⚠️ Skipping (already exists): ${contest.name} [${contest.platform}]`);
      }
    }

    console.log("🎉 All contests added successfully!");
  } catch (error) { 
    console.error("❌ Error adding contests:", error);
  } finally {
    console.log("Done")
    await prisma.$disconnect();
  }
};

const updateUpcomingContests = async () => {
    try {
      console.log("🔄 Checking for new upcoming contests...");
      const { upcomingContests: ccUpcoming } = await codechefScraper();
      const { upcomingContests: lcUpcoming } = await leetCodeScraper();
      const { upcomingContests: cfUpcoming } = await codeforcesScraper();
  
      const allUpcomingContests = [
        ...ccUpcoming.map(c => ({ ...c, platform: "CC" })),
        ...lcUpcoming.map(c => ({ ...c, platform: "LC" })),
        ...cfUpcoming.map(c => ({ ...c, platform: "CF" })),
      ];
  
      console.log(`📌 Found ${allUpcomingContests.length} upcoming contests.`);
  
      for (const contest of allUpcomingContests) {
        const existingContest = await prisma.contests.findFirst({
          where: { title: contest.name, date: contest.date, time: contest.time }
        });
  
        if (!existingContest) {
          await prisma.contests.create({
            data: {
              title: contest.name,
              date: contest.date,
              time: contest.time,
              duration: contest.duration,
              link: contest.link,
              platform: contest.platform
            }
          });
          console.log(`✅ New Contest Added: ${contest.name} [${contest.platform}]`);
        } else {
          console.log(`⚠️ Skipping (already exists): ${contest.name} [${contest.platform}]`);
        }
      }
  
      console.log("🎉 Contest update check completed!");
    } catch (error) {
      console.error("❌ Error updating contests:", error);
    } finally {
      await prisma.$disconnect();
    }
  };

cron.schedule("0 0 * * *", () => {
console.log("🕛 Running daily contest update...");
updateUpcomingContests();
});


addContestsToDB();
// fetchSolutionVideos(playlists.LC);
