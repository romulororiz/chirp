import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { LoadingPage } from "~/components/Loading";
import { PostsView } from "~/components/PostView";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const ProfileFeed = ({ userId }: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId });

  if (isLoading) return <LoadingPage />;

  if (!data || !data.length) return <div>User has no posts</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostsView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });

  if (!data || !data.post.content) return <div>Post not found</div>;

  console.log(data);

  return (
    <>
      <Head>
        <title>{`Chirp | ${data.post.content}`}</title>
        <meta name="description" content="Generated by create-t3-app" />
      </Head>
      <PageLayout>
        <div className="relative flex h-36 items-center gap-6 bg-slate-600 p-4"></div>
        <div className="h-[64px]" />

        <div className="border-b border-slate-400" />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  // SSG is used to prefetch data for the page before it is rendered
  // This is useful for pages that are not frequently updated
  // and can be pre-rendered at build time
  const ssg = generateSSGHelper();
  const id = ctx.params?.id;

  if (typeof id !== "string") throw new Error("No Id provided");

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SinglePostPage;