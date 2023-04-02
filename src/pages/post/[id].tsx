import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
dayjs.extend(relativeTime);

const SinglePostPage: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if user isn't loaded yet to prevent flash of unauthenticated content
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Chirp | Post</title>
        <meta name="description" content="Emojiland" />
      </Head>
      <main className="flex justify-center">
        <div className="h-screen w-full  md:max-w-2xl">
          <div>Post Page</div>
        </div>
      </main>
    </>
  );
};

export default SinglePostPage;
