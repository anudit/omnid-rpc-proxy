import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { getEnv } from "./utils";

const ratelimit = new Ratelimit({
    redis: new Redis({
        url: getEnv('RATELIMIT_UPSTASH_REDIS_REST_URL'),
        token: getEnv('RATELIMIT_UPSTASH_REDIS_REST_TOKEN'),
    }),
    limiter: Ratelimit.slidingWindow(100, "10 s"),
    timeout: 1000,
    analytics: true
});

export default ratelimit;