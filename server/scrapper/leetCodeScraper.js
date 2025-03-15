import dayjs from "dayjs";
import puppeteer from "puppeteer";
const formatDateTime = (date) => {
  const contestDateTime = dayjs(`${date}`, "MMM/DD/YYYY HH:mm").toISOString();
  return contestDateTime;
};

const calculateContestDate = (countdown) => {
  const now = new Date();
  const regex = /(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/;
  const match = countdown.match(regex);

  if (!match) return "Invalid Timer Format";
  const days = match[1] ? parseInt(match[1]) : 0;
  const hours = match[2] ? parseInt(match[2]) : 0;
  const minutes = match[3] ? parseInt(match[3]) : 0;
  const seconds = match[4] ? parseInt(match[4]) : 0;

  const totalMilliseconds =
    (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000;

  const contestDate = new Date(now.getTime() + totalMilliseconds);

  return contestDate.toLocaleString();
};

export const getUpcomingLeetCodeContests = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://leetcode.com/contest/", {
    waitUntil: "networkidle2",
  });
  console.log("📌 Finding upcoming contests...");
  const upcomingElements = await page.$$(
    "div.swiper-wrapper > div.swiper-slide"
  );
  let upcomingContests = await Promise.all(
    upcomingElements.map(async (el) => {
      return await page.evaluate((element) => {
        const [countdown, name] = element.innerText.split("\n");
        return {
          name,
          countdown: countdown.includes(" in ")
            ? countdown.split(" in ")[1].trim()
            : "No Timer Found",
          link: element.querySelector("a")?.href || "No Link Found",
        };
      }, el);
    })
  );

  upcomingContests = upcomingContests.filter(
    (contest) => !contest.name.includes("Ended")
  );
  upcomingContests.forEach((contest) => {
    if (contest.countdown !== "No Timer Found") {
      const contestDateWithTime = calculateContestDate(contest.countdown);
      const contestDate = contestDateWithTime.split(",")[0];
      const date = new Date(contestDate);
      const monthAbbr = date.toLocaleString("en-US", { month: "short" });
      contest.date = `${monthAbbr}/${date.getDate()}/${date.getFullYear()}`;
      contest.time = contest.name.includes("Biweekly") ? "20:00" : "8:00";
      const formattedDate = `${contest.date} ${contest.time}`;
      contest.contestDateTime = formatDateTime(formattedDate);
      contest.duration = "2 Hrs";
    }
  }); 
  // console.log(upcomingContests);

  console.log(`✅ Found ${upcomingContests.length} upcoming contests.`);
  await browser.close();
  return upcomingContests;
};

export const getPastLeetCodeContests = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://leetcode.com/contest/", {
    waitUntil: "networkidle2",
  });
  console.log("📌 Finding past contests...");
  let pastContests = [];
  let hasNextPage = true;
  let pageIndex = 0;

  while (hasNextPage && pageIndex < 40) {
    const pageData = await page.evaluate(() => {
      const pastContestElements = document.querySelectorAll(
        "div.min-h-\\[966px\\] div.mt-\\[11px\\] > div > div.px-4"
      );
      let pastContestsData = [];

      pastContestElements.forEach((el) => {
        const contestLink = el.querySelector("a")?.href || "No Link Found";
        const contestText = el.innerText.split("\n");
        if (contestText.length >= 2) {
          const dateString = contestText[1].trim();
          const datePart = dateString.match(/^[A-Za-z]+ \d{1,2}, \d{4}/)[0];
          const date = new Date(datePart);
          const monthAbbr = date.toLocaleString("en-US", { month: "short" });
          const time = contestText[0].trim().includes("Biweekly") ? "20:00" : "8:00";
          const formattedDate = `${monthAbbr}/${date.getDate()}/${date.getFullYear()}`;
          const contestDateTime = formattedDate + " " + time;
          pastContestsData.push({
            name: contestText[0].trim(),
            contestDateTime,
            duration: "2 Hrs",
            link: contestLink,
          });
        }
      });
      return pastContestsData;
    });

    pastContests.push(...pageData);
    const nextButton = await page.$("button[aria-label='next']");
    if (nextButton) {
      await nextButton.click();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      hasNextPage = false;
    }
    pageIndex++;
  }

  console.log(`✅ Total past contests found: ${pastContests.length}`);
  await browser.close();
  pastContests.forEach((contest) => {
    contest.contestDateTime = formatDateTime(contest.contestDateTime);
  });
  // console.log(pastContests);
  return pastContests;
};

export const leetCodeScraper = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 1600 },
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://leetcode.com/contest/", {
    waitUntil: "networkidle2",
  });

  const upcomingContests = await getUpcomingLeetCodeContests();
  const pastContests = await getPastLeetCodeContests(page);

  await browser.close();
  return { upcomingContests, pastContests };
};

getPastLeetCodeContests();