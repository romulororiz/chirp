import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
dayjs.extend(relativeTime);

// Trick to get the type of the data returned by the API
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostsView = (props: PostWithUser) => {
  const { post, user } = props;

  return (
    <div
      key={post.id}
      className="flex items-center gap-3 border-b border-slate-400 p-4"
    >
      <Link href={`/@${user.username}`}>
        <Image
          src={user.profileImageUrl}
          alt={`@${user.username}`}
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
      </Link>
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${user.username}`}>
            <span>{`@${user.username}`}</span>
          </Link>{" "}
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{`· ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};
