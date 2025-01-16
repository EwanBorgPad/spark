import { jsonResponse, reportError } from "./cfPagesFunctionsUtils";
import { UserService } from "../services/userService";
const TWITTER_API_OAUTH2_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const TWITTER_API_GET_ME_URL = "https://api.twitter.com/2/users/me"; // ?user.fields=profile_image_url
const TWITTER_API_GET_FOLLOWING_URL = "https://api.twitter.com/2/users/:id/following?max_results=1000";
export const onRequest = async (ctx) => {
    const db = ctx.env.DB;
    try {
        const url = ctx.request.url;
        const code = new URL(url).searchParams.get("code");
        const address = new URL(url).searchParams.get("address");
        if (!code || !address) {
            return new Response(JSON.stringify({ message: "Code or address is missing!" }), {
                status: 400,
            });
        }
        const redirectUri = new URL(url);
        redirectUri.searchParams.delete("state");
        redirectUri.searchParams.delete("code");
        // sign in with code
        const accessToken = await signInWithCode({
            code,
            clientId: ctx.env.VITE_TWITTER_CLIENT_ID,
            redirectUri: redirectUri.href,
        });
        // get me
        const getMeRes = await fetch(TWITTER_API_GET_ME_URL, {
            method: "get",
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });
        const getMeResponse = await getMeRes.json();
        console.log({ getMeResponse });
        /**
         * TODO @twitter this is unimplemented because of API limitations (get followers requires a paid account)
         * For now, assume all users hitting this endpoint ARE following BorgPad
         */
        // get followers
        const getFollowingUrl = TWITTER_API_GET_FOLLOWING_URL.replace(":id", getMeResponse.data.id);
        const getFollowing = await fetch(getFollowingUrl, {
            method: "get",
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });
        const getFollowingResponse = await getFollowing.json();
        console.log({ getFollowingResponse });
        // database business
        const twitterId = getMeResponse.data.id;
        // check if the user is stored in the db
        const existingUser = await UserService.findUserByAddress({ db, address });
        console.log({ existingUser });
        const initialTwitterData = {
            twitterId,
            follows: {},
        };
        if (!existingUser) {
            console.log("User not found in db, inserting...");
            const json = { twitter: initialTwitterData };
            await db
                .prepare("INSERT INTO user (address, json) VALUES (?1, ?2)")
                .bind(address, JSON.stringify(json))
                .run();
            console.log("User inserted into db.");
        }
        else {
            console.log("User found in db, updating...");
            const json = existingUser.json ?? {};
            if (!json.twitter)
                json.twitter = initialTwitterData;
            await db
                .prepare("UPDATE user SET json = ?2 WHERE address = ?1")
                .bind(address, JSON.stringify(json))
                .run();
            console.log("User twitter id updated");
        }
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/",
            },
        });
    }
    catch (e) {
        await reportError(db, e);
        return jsonResponse({ message: "Something went wrong..." }, 500);
    }
};
async function signInWithCode({ code, clientId, redirectUri, }) {
    const twitterAuthUrl = new URL(TWITTER_API_OAUTH2_TOKEN_URL);
    twitterAuthUrl.searchParams.set("code", code);
    twitterAuthUrl.searchParams.set("grant_type", "authorization_code");
    twitterAuthUrl.searchParams.set("client_id", clientId);
    twitterAuthUrl.searchParams.set("redirect_uri", redirectUri);
    twitterAuthUrl.searchParams.set("code_verifier", "challenge");
    const authRes = await fetch(twitterAuthUrl, {
        method: "post",
    });
    const authResponse = await authRes.json();
    return authResponse["access_token"];
}
