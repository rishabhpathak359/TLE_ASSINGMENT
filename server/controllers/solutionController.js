const playlists = {
    LC: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
    CC: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
    CF: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
  };

  
  export const fetchSolutionVideos = async (playlistId) => {
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