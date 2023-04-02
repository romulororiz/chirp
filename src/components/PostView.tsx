import { useAuth } from "@clerk/nextjs";
import type { Post } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { api, type RouterOutputs } from "~/utils/api";
import { cn } from "~/utils/cn";
import { LoadingSpinner } from "./Loading";
dayjs.extend(relativeTime);

// Trick to get the type of the data returned by the API
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostsView = (props: PostWithUser) => {
  const { post, user } = props;

  // get logged in user
  const { userId } = useAuth();

  // check if logged in user is the owner of the post
  const isPostOwner = (post: Post, userId: string | null | undefined) => {
    if (!userId) return false;

    return userId === post.authorId;
  };

  const ctx = api.useContext();

  const { mutate: deletePost, isLoading: isDeleting } =
    api.posts.delete.useMutation({
      onSuccess: () => {
        // invalidate the query to refetch the data
        void ctx.posts.getAll.invalidate();
      },
      onError: (err) => {
        console.log(err.message);
        return toast.error(err.message);
      },
    });

  return (
    <div
      key={post.id}
      className="flex items-center gap-3 border-b border-slate-400 p-4"
    >
      <Link href={`/@${user.username}`}>
        <Image
          src={user.profileImageUrl}
          alt={`@${user.username}`}
          className="h-14 min-h-[56px] w-14 min-w-[56px] rounded-full"
          width={56}
          height={56}
        />
      </Link>
      <div className="flex w-full flex-col">
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
        <span className="mt-2 text-2xl">{post.content}</span>
        {isPostOwner(post, userId) && (
          <div className="mt-2 flex w-full justify-end gap-2">
            <button
              onClick={() => deletePost({ id: post.id })}
              className={cn(
                "flex items-center text-slate-300 hover:text-slate-100",
                {
                  "cursor-not-allowed text-gray-800 hover:text-gray-800":
                    isDeleting,
                }
              )}
              disabled={isDeleting}
            >
              {isDeleting && (
                <span className="mr-2">
                  <LoadingSpinner size={14} />
                </span>
              )}
              <Trash2
                size={18}
                className="transition-all hover:text-red-400 "
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
